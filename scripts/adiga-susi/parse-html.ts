/**
 * HTML parser for adiga.kr admission data tables.
 * Ported from Python extract_adiga_table.py.
 */

export interface AdmissionRecord {
  year: number;
  admissionType: string; // 전형 (e.g., "수시 지역균형전형")
  departmentName: string; // 모집단위
  quota: number | null; // 모집인원
  competitionRate: number | null; // 경쟁률
  waitlistRank: number | null; // 충원합격순위
  cut50: string | null; // 50% cut
  cut70: string | null; // 70% cut
  subjects: string | null; // 평가에 반영된 교과목
}

/**
 * Parse competition rate from 'x:y' format to float.
 * Examples: '3.75:1' -> 3.75, '10.5:1' -> 10.5
 */
function parseCompetitionRate(rateStr: string): number | null {
  if (!rateStr || rateStr.trim() === "" || rateStr.trim() === "-") {
    return null;
  }

  const match = rateStr.trim().match(/^([\d.]+):([\d.]+)$/);
  if (match) {
    const numerator = parseFloat(match[1]!);
    const denominator = parseFloat(match[2]!);
    if (denominator !== 0) {
      return Math.round((numerator / denominator) * 100) / 100;
    }
  }

  // Try direct float conversion as fallback
  const directParse = parseFloat(rateStr.trim());
  return isNaN(directParse) ? null : directParse;
}

/**
 * Parse integer value from string, handling '-' as null.
 */
function parseIntOrNull(str: string): number | null {
  if (!str || str.trim() === "" || str.trim() === "-") {
    return null;
  }
  const parsed = parseInt(str.trim(), 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse string value, converting '-' to null.
 */
function parseStringOrNull(str: string): string | null {
  if (!str || str.trim() === "" || str.trim() === "-") {
    return null;
  }
  return str.trim();
}

/**
 * Check if text looks like an admission type name (not a table header).
 */
function isAdmissionTypeName(text: string): boolean {
  // Skip if empty or too long
  if (!text || text.length > 50) return false;

  // Skip common header keywords
  const headerKeywords = [
    "모집단위",
    "모집인원",
    "경쟁률",
    "충원",
    "cut",
    "교과목",
    "50%",
    "70%",
    "합격",
    "순위",
  ];
  if (headerKeywords.some((kw) => text.includes(kw))) return false;

  // Known admission type patterns
  const admissionTypePatterns = [
    "전형",
    "균형",
    "우수",
    "국제",
    "기회",
    "특별",
    "일반",
    "지역",
    "고른기회",
    "활동우수형",
    "면접형",
    "서류형",
    "추천형",
    "학종",
    "교과",
    "논술",
    "실기",
    "특기자",
  ];

  return admissionTypePatterns.some((pattern) => text.includes(pattern));
}

/**
 * Extract admission type from colspan header cells.
 * Universities like 연세대 use colspan cells for admission type headers.
 */
function extractColspanAdmissionType(row: string): string | null {
  // Look for td with colspan >= 4
  const colspanMatch = row.match(/<td[^>]*colspan=["']?(\d+)["']?[^>]*>([\s\S]*?)<\/td>/i);
  if (!colspanMatch) return null;

  const colspan = parseInt(colspanMatch[1]!, 10);
  if (colspan < 4) return null;

  // Extract text content
  const cellHtml = colspanMatch[2] ?? "";
  const text = cellHtml
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Check if it looks like an admission type
  if (text && isAdmissionTypeName(text)) {
    return text;
  }

  return null;
}

/**
 * Extract section header (campus + admission type) from paragraph before table.
 * Pattern: [YYYY학년도] 서울캠퍼스 학생부종합전형(면접형)
 */
function extractSectionHeader(html: string, tableStartIndex: number): string | null {
  // Look backwards from the table to find section header in <p> tag
  const searchStart = Math.max(0, tableStartIndex - 2000);
  const beforeTable = html.slice(searchStart, tableStartIndex);

  // Strip HTML tags for easier matching
  const textContent = beforeTable
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

  // Look for patterns like "서울캠퍼스 학생부종합전형" or "글로벌캠퍼스 학생부종합전형"
  // The admission type may have spaces like "학생부종합전형 ( 면접형 )"
  const campusMatch = textContent.match(
    /(서울캠퍼스|글로벌캠퍼스)\s+(학생부[^학]*전형[^)]*\)?)/i
  );
  if (campusMatch) {
    const campus = campusMatch[1]!;
    const admissionType = campusMatch[2]!.trim();
    return `${campus} ${admissionType}`;
  }

  return null;
}

/**
 * Extract admission data from HTML content.
 * Handles table parsing with header detection and merged cells.
 */
export function parseAdmissionHtml(htmlContent: string): AdmissionRecord[] {
  const records: AdmissionRecord[] = [];

  let currentYear = 0;
  let currentAdmissionType = "";

  // Extract year from [YYYY학년도] pattern
  const yearMatch = htmlContent.match(/\[(\d{4})학년도\]/);
  if (yearMatch) {
    currentYear = parseInt(yearMatch[1]!, 10);
  }

  // Also check for <p> tag with year
  const pYearMatch = htmlContent.match(/\[?(\d{4})\]?\s*학년도/);
  if (pYearMatch && currentYear === 0) {
    currentYear = parseInt(pYearMatch[1]!, 10);
  }

  // If still no year, try to extract from searchSyr parameter (2026 -> 2025)
  if (currentYear === 0) {
    currentYear = 2025;
  }

  // Parse HTML using regex-based extraction
  // Find all tables with their positions
  const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
  const tables: { html: string; index: number }[] = [];
  let match;
  while ((match = tableRegex.exec(htmlContent)) !== null) {
    tables.push({ html: match[0], index: match.index });
  }

  if (tables.length === 0) {
    return records;
  }

  for (const { html: table, index: tableIndex } of tables) {
    // Check for section header before this table (e.g., "서울캠퍼스 학생부종합전형")
    // This takes precedence over in-table headers
    const sectionHeader = extractSectionHeader(htmlContent, tableIndex);
    const hasCampusHeader = sectionHeader !== null;
    if (sectionHeader) {
      currentAdmissionType = sectionHeader;
    }

    // Extract rows from tbody or table
    const tbodyMatch = table.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
    const rowsHtml = tbodyMatch?.[1] ?? table;

    const rows = rowsHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
    if (!rows) continue;

    for (const row of rows) {
      // Check for colspan admission type header (연세대 style)
      // But don't override if we already have a campus header from section
      const colspanType = extractColspanAdmissionType(row);
      if (colspanType && !hasCampusHeader) {
        currentAdmissionType = colspanType;
        // Don't continue - this row might also have other cells we need to process
      }

      // Extract cells from the row
      const cells: string[] = [];
      const cellMatches = row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi);

      for (const cellMatch of cellMatches) {
        // Extract text content, removing HTML tags
        const cellText = (cellMatch[1] ?? "")
          .replace(/<[^>]*>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        cells.push(cellText);
      }

      if (cells.length === 0) continue;

      const rowText = cells.join(" ");

      // Detect year marker
      const rowYearMatch = rowText.match(/\[(\d{4})학년도\]/);
      if (rowYearMatch) {
        currentYear = parseInt(rowYearMatch[1]!, 10);
        continue;
      }

      // Detect admission type in header (서울대 style - cells containing "전형")
      // But don't override if we already have a campus header from section
      if (!hasCampusHeader && cells.some((cell) => cell.includes("전형"))) {
        for (const cell of cells) {
          if (cell.includes("전형")) {
            currentAdmissionType = cell.trim();
            break;
          }
        }
        continue;
      }

      // Skip header rows - check first cell only to avoid false positives
      // (data rows may contain keywords like "교과목" in the subjects field)
      const firstCell = cells[0] || "";
      const headerKeywords = [
        "모집단위",
        "모집인원",
        "경쟁률",
        "충원",
        "50%",
        "70%",
      ];
      if (headerKeywords.some((kw) => firstCell.includes(kw))) {
        continue;
      }

      // Skip warning rows
      if (
        rowText.includes("※") ||
        rowText.includes("대학별") ||
        rowText.includes("비교할 수 없습니다")
      ) {
        continue;
      }

      // Data row - need at least 6 columns
      if (cells.length >= 6) {
        const departmentName = cells[0]?.trim() || "";

        // Skip empty or invalid department names
        if (!departmentName || departmentName === " ") {
          continue;
        }

        const cut50 = parseStringOrNull(cells[4] || "");
        const cut70 = parseStringOrNull(cells[5] || "");

        // Skip rows where both cut50 and cut70 are empty
        if (!cut50 && !cut70) {
          continue;
        }

        const record: AdmissionRecord = {
          year: currentYear,
          admissionType: currentAdmissionType,
          departmentName,
          quota: parseIntOrNull(cells[1] || ""),
          competitionRate: parseCompetitionRate(cells[2] || ""),
          waitlistRank: parseIntOrNull(cells[3] || ""),
          cut50,
          cut70,
          subjects: parseStringOrNull(cells[6] || ""),
        };

        records.push(record);
      }
    }
  }

  return records;
}

/**
 * Print summary of extracted records.
 */
export function printSummary(records: AdmissionRecord[]): void {
  const byType: Record<string, number> = {};
  for (const r of records) {
    byType[r.admissionType] = (byType[r.admissionType] || 0) + 1;
  }

  console.log("=== Extraction Summary ===");
  console.log(`Total records: ${records.length}`);
  if (records.length > 0) {
    console.log(`Year: ${records[0]!.year}`);
  }
  console.log("\nRecords by admission type:");
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`  ${type}: ${count}`);
  }
}
