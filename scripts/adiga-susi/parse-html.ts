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
    const numerator = parseFloat(match[1]);
    const denominator = parseFloat(match[2]);
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
    currentYear = parseInt(yearMatch[1], 10);
  }

  // Also check for <p> tag with year
  const pYearMatch = htmlContent.match(/\[?(\d{4})\]?\s*학년도/);
  if (pYearMatch && currentYear === 0) {
    currentYear = parseInt(pYearMatch[1], 10);
  }

  // If still no year, try to extract from searchSyr parameter (2026 -> 2025)
  if (currentYear === 0) {
    currentYear = 2025;
  }

  // Parse HTML using regex-based extraction
  // Find all table rows
  const tableMatch = htmlContent.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
  if (!tableMatch) {
    return records;
  }

  for (const table of tableMatch) {
    // Extract rows from tbody or table
    const tbodyMatch = table.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
    const rowsHtml = tbodyMatch ? tbodyMatch[1] : table;

    const rows = rowsHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
    if (!rows) continue;

    for (const row of rows) {
      // Extract cells from the row
      const cells: string[] = [];
      const cellMatches = row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi);

      for (const cellMatch of cellMatches) {
        // Extract text content, removing HTML tags
        let cellText = cellMatch[1]
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
        currentYear = parseInt(rowYearMatch[1], 10);
        continue;
      }

      // Detect admission type in header
      if (cells.some((cell) => cell.includes("전형"))) {
        for (const cell of cells) {
          if (cell.includes("전형")) {
            currentAdmissionType = cell.trim();
            break;
          }
        }
        continue;
      }

      // Skip header rows
      const headerKeywords = [
        "모집단위",
        "모집인원",
        "경쟁률",
        "충원",
        "cut",
        "교과목",
        "50%",
        "70%",
      ];
      if (headerKeywords.some((kw) => rowText.includes(kw))) {
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

        const record: AdmissionRecord = {
          year: currentYear,
          admissionType: currentAdmissionType,
          departmentName,
          quota: parseIntOrNull(cells[1] || ""),
          competitionRate: parseCompetitionRate(cells[2] || ""),
          waitlistRank: parseIntOrNull(cells[3] || ""),
          cut50: parseStringOrNull(cells[4] || ""),
          cut70: parseStringOrNull(cells[5] || ""),
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
    console.log(`Year: ${records[0].year}`);
  }
  console.log("\nRecords by admission type:");
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`  ${type}: ${count}`);
  }
}
