/**
 * LLM-based HTML parser for adiga.kr admission data tables.
 * Uses OpenAI to extract structured data from complex/varying table formats.
 */

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import type { AdmissionRecord } from "./parse-html";

// Schema for a single admission record
const AdmissionRecordSchema = z.object({
  year: z.number().describe("학년도 (e.g., 2025)"),
  admissionType: z
    .string()
    .describe("전형명 (e.g., 학교생활우수자전형, 학생부종합전형)"),
  departmentName: z
    .string()
    .describe("모집단위/학과명 (e.g., 컴퓨터공학과, 경영학과)"),
  quota: z.number().nullable().describe("모집인원"),
  competitionRate: z.number().nullable().describe("경쟁률 (숫자만, e.g., 10.5)"),
  waitlistRank: z.number().nullable().describe("충원합격순위"),
  cut50: z
    .string()
    .nullable()
    .describe("50% cut 또는 평균 등급 (e.g., '2.11', '1.5')"),
  cut70: z.string().nullable().describe("70% cut 등급 (e.g., '2.20', '1.8')"),
  subjects: z.string().nullable().describe("평가에 반영된 교과목"),
});

// Schema for the full response
const AdmissionDataSchema = z.object({
  records: z.array(AdmissionRecordSchema),
});

const SYSTEM_PROMPT = `You are a data extraction expert. Extract ALL admission statistics from the Korean university HTML table.

Key field mappings:
- 모집단위 = departmentName (the specific department/major, NOT the college name)
- 모집인원 = quota
- 경쟁률 = competitionRate (convert "10.5:1" to 10.5, or just use the number if no ":1")
- 충원합격순위 = waitlistRank
- 50% cut / 평균 = cut50 (some universities use "평균" instead of "50% cut")
- 70% cut = cut70
- 교과목 = subjects (평가에 반영된 교과목)

Important rules:
1. Extract ALL data rows - there may be dozens of departments
2. The admission type (전형명) is usually in a colspan header cell or section header
3. If there are campus names (서울, 글로벌, 세종), include them in departmentName or note it
4. Skip rows where both cut50 and cut70 are empty/null
5. For departmentName, extract the specific department name, not the college grouping
6. If a cell contains "-" or is empty, treat it as null
7. Year is usually in [YYYY학년도] format`;

/**
 * Clean HTML by removing all non-essential elements.
 * Aggressively strips CSS, scripts, comments, and unnecessary attributes.
 */
function cleanHtml(html: string): string {
  let cleaned = html;

  // Remove DOCTYPE, html, head, body tags (keep content)
  cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, "");
  cleaned = cleaned.replace(/<\/?html[^>]*>/gi, "");
  cleaned = cleaned.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "");
  cleaned = cleaned.replace(/<\/?body[^>]*>/gi, "");

  // Remove style tags and their content
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Remove script tags
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");

  // Remove all style attributes
  cleaned = cleaned.replace(/\s+style="[^"]*"/gi, "");
  cleaned = cleaned.replace(/\s+style='[^']*'/gi, "");

  // Remove all class attributes
  cleaned = cleaned.replace(/\s+class="[^"]*"/gi, "");
  cleaned = cleaned.replace(/\s+class='[^']*'/gi, "");

  // Remove all id attributes
  cleaned = cleaned.replace(/\s+id="[^"]*"/gi, "");
  cleaned = cleaned.replace(/\s+id='[^']*'/gi, "");

  // Remove layout/presentation attributes
  cleaned = cleaned.replace(/\s+(valign|align|width|height|bgcolor|border|cellpadding|cellspacing)="[^"]*"/gi, "");

  // Remove data-* attributes
  cleaned = cleaned.replace(/\s+data-[a-z-]+="[^"]*"/gi, "");

  // Remove font tags (keep content)
  cleaned = cleaned.replace(/<\/?font[^>]*>/gi, "");

  // Remove span tags (keep content) - they're usually just for styling
  cleaned = cleaned.replace(/<\/?span[^>]*>/gi, "");

  // Remove empty p tags
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/gi, "");

  // Convert &nbsp; to space
  cleaned = cleaned.replace(/&nbsp;/g, " ");

  // Remove excessive whitespace
  cleaned = cleaned.replace(/>\s+</g, "><");
  cleaned = cleaned.replace(/\s+/g, " ");

  return cleaned.trim();
}

/**
 * Extract and clean table HTML from the full response.
 * First cleans the entire HTML, then extracts tables.
 */
function extractAndCleanTables(html: string): { tables: string[]; year: number } {
  // Extract year before cleaning
  const yearMatch = html.match(/\[?(\d{4})\]?\s*학년도/);
  const year = yearMatch ? parseInt(yearMatch[1]!, 10) : 2025;

  // Clean the HTML first
  const cleanedHtml = cleanHtml(html);
  const reduction = Math.round((1 - cleanedHtml.length / html.length) * 100);
  console.log(`  HTML cleaned: ${html.length} → ${cleanedHtml.length} bytes (${reduction}% reduction)`);

  // Find all tables with surrounding context (for admission type headers)
  const tables: string[] = [];
  const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
  let match;

  while ((match = tableRegex.exec(cleanedHtml)) !== null) {
    const tableStart = match.index;

    // Get context before table (look for admission type)
    const contextStart = Math.max(0, tableStart - 300);
    const beforeTable = cleanedHtml.slice(contextStart, tableStart);

    // Extract admission type from context
    const typeMatch = beforeTable.match(/(\S+전형[^<]*)/);
    const admissionType = typeMatch ? typeMatch[1]?.trim() : "";

    let tableHtml = match[0];

    // Add context header if found
    if (admissionType) {
      tableHtml = `[전형: ${admissionType}]\n${tableHtml}`;
    }

    tables.push(tableHtml);
  }

  return { tables, year };
}

/**
 * Parse a single table with LLM.
 */
async function parseTableWithLLM(
  tableHtml: string,
  year: number,
  model: string,
  universityName: string
): Promise<AdmissionRecord[]> {
  const { object } = await generateObject({
    model: openai(model),
    schema: AdmissionDataSchema,
    system: SYSTEM_PROMPT,
    prompt: `Extract ALL admission records from this ${universityName} table for ${year}학년도:\n\n${tableHtml}`,
  });

  return object.records.map((record) => ({
    ...record,
    year: record.year || year,
  }));
}

/**
 * Parse admission HTML using LLM.
 * Extracts and cleans tables, then processes each with LLM.
 */
export async function parseAdmissionHtmlWithLLM(
  htmlContent: string,
  options?: {
    model?: string;
    universityName?: string;
  }
): Promise<AdmissionRecord[]> {
  const model = options?.model ?? "gpt-4o-mini";
  const universityName = options?.universityName ?? "대학교";

  // Extract and clean tables
  const { tables, year } = extractAndCleanTables(htmlContent);

  if (tables.length === 0) {
    console.log("  No tables found in HTML");
    return [];
  }

  console.log(`  Found ${tables.length} tables, processing with LLM...`);

  // Process each table
  const allRecords: AdmissionRecord[] = [];

  for (let i = 0; i < tables.length; i++) {
    const tableHtml = tables[i]!;

    // Skip very small tables (likely headers/footers)
    if (tableHtml.length < 500) {
      continue;
    }

    try {
      const records = await parseTableWithLLM(tableHtml, year, model, universityName);
      allRecords.push(...records);
      console.log(`    Table ${i + 1}: ${records.length} records`);
    } catch (error) {
      console.error(`    Table ${i + 1} error:`, error instanceof Error ? error.message : error);
    }
  }

  return allRecords;
}

/**
 * Parse with retry logic for robustness.
 */
export async function parseWithRetry(
  htmlContent: string,
  options?: {
    model?: string;
    universityName?: string;
    maxRetries?: number;
  }
): Promise<AdmissionRecord[]> {
  const maxRetries = options?.maxRetries ?? 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await parseAdmissionHtmlWithLLM(htmlContent, options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        console.log(`  Retry ${attempt + 1}/${maxRetries}...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError;
}
