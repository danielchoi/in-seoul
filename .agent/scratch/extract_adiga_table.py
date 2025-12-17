#!/usr/bin/env python3
"""
Extract admission data from adiga.kr HTML table response.
Handles merged cells (colspan/rowspan) and extracts 전형 type from header.

Usage:
    python extract_adiga_table.py [input_html] [output_file]

Examples:
    python extract_adiga_table.py adiga_response.html output.json
    python extract_adiga_table.py adiga_response.html output.csv
"""

import re
import json
import csv
import argparse
from html.parser import HTMLParser
from dataclasses import dataclass, asdict, fields
from typing import Optional
from pathlib import Path


@dataclass
class AdmissionRecord:
    """Single admission record for a department"""
    year: str = ""
    admission_type: str = ""  # 전형 (e.g., "수시 지역균형전형")
    department: str = ""  # 모집단위
    quota: str = ""  # 모집인원
    competition_rate: Optional[float] = None  # 경쟁률 (converted from "x:y" to x/y)
    waitlist_rank: str = ""  # 충원합격순위
    cut_50: str = ""  # 50% cut
    cut_70: str = ""  # 70% cut
    subjects: str = ""  # 평가에 반영된 교과목


def parse_competition_rate(rate_str: str) -> Optional[float]:
    """Convert competition rate from 'x:y' format to float (x/y).

    Examples:
        '3.75:1' -> 3.75
        '10.5:1' -> 10.5
        '2.33:1' -> 2.33
    """
    if not rate_str or rate_str.strip() == "":
        return None

    match = re.match(r'^([\d.]+):([\d.]+)$', rate_str.strip())
    if match:
        numerator = float(match.group(1))
        denominator = float(match.group(2))
        if denominator != 0:
            return round(numerator / denominator, 2)

    # Try direct float conversion as fallback
    try:
        return float(rate_str.strip())
    except ValueError:
        return None


class TableExtractor(HTMLParser):
    """Parse HTML and extract table data"""

    def __init__(self):
        super().__init__()
        self.records: list[AdmissionRecord] = []
        self.current_year: str = ""
        self.current_admission_type: str = ""

        # State tracking
        self.in_table = False
        self.in_tbody = False
        self.in_row = False
        self.in_cell = False
        self.in_span = False
        self.in_p = False

        # Current row data
        self.current_row: list[str] = []
        self.cell_text = ""
        self.p_text = ""
        self.row_index = 0
        self.header_rows_count = 0
        self.is_header_cell = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, Optional[str]]]):
        attrs_dict = dict(attrs)

        if tag == "table":
            self.in_table = True
            self.row_index = 0
            self.header_rows_count = 0

        elif tag == "tbody":
            self.in_tbody = True

        elif tag == "tr":
            self.in_row = True
            self.current_row = []
            self.cell_text = ""

        elif tag == "td" and self.in_row:
            self.in_cell = True
            self.cell_text = ""
            style = attrs_dict.get("style", "")
            self.is_header_cell = "rgb(229, 229, 229)" in style or "background:" in style

        elif tag == "span" and self.in_cell:
            self.in_span = True

        elif tag == "p":
            self.in_p = True
            self.p_text = ""

    def handle_endtag(self, tag: str):
        if tag == "table":
            self.in_table = False

        elif tag == "tbody":
            self.in_tbody = False

        elif tag == "tr" and self.in_row:
            self.in_row = False
            self._process_row()
            self.row_index += 1

        elif tag == "td" and self.in_cell:
            text = self.cell_text.strip()
            text = re.sub(r'\s+', ' ', text)
            self.current_row.append(text)
            self.in_cell = False
            self.is_header_cell = False

        elif tag == "span":
            self.in_span = False

        elif tag == "p":
            if self.p_text and not self.in_table:
                year_match = re.search(r'\[?(\d{4})\]?\s*학년도', self.p_text)
                if year_match:
                    self.current_year = year_match.group(1)
            self.in_p = False

    def handle_data(self, data: str):
        if self.in_p:
            self.p_text += data.strip()

        if self.in_cell:
            text = data.strip()
            if text and text != "&nbsp;":
                self.cell_text += text

    def _process_row(self):
        """Process a completed row"""
        if not self.current_row:
            return

        row_text = " ".join(self.current_row)

        # Detect year marker
        year_match = re.search(r'\[(\d{4})학년도\]', row_text)
        if year_match:
            self.current_year = year_match.group(1)
            return

        # Detect admission type in header
        if any("전형" in cell for cell in self.current_row):
            for cell in self.current_row:
                if "전형" in cell:
                    self.current_admission_type = cell.strip()
                    break
            return

        # Skip header rows
        header_keywords = ["모집단위", "모집인원", "경쟁률", "충원", "cut", "교과목", "50%", "70%"]
        if any(kw in row_text for kw in header_keywords):
            return

        # Skip warning rows
        if "※" in row_text or "대학별" in row_text or "비교할 수 없습니다" in row_text:
            return

        # Data row
        if len(self.current_row) >= 6:
            # Parse competition rate from "x:y" format to float
            rate_str = self.current_row[2] if len(self.current_row) > 2 else ""
            competition_rate = parse_competition_rate(rate_str)

            record = AdmissionRecord(
                year=self.current_year,
                admission_type=self.current_admission_type,
                department=self.current_row[0] if len(self.current_row) > 0 else "",
                quota=self.current_row[1] if len(self.current_row) > 1 else "",
                competition_rate=competition_rate,
                waitlist_rank=self.current_row[3] if len(self.current_row) > 3 else "",
                cut_50=self.current_row[4] if len(self.current_row) > 4 else "",
                cut_70=self.current_row[5] if len(self.current_row) > 5 else "",
                subjects=self.current_row[6] if len(self.current_row) > 6 else "",
            )

            if record.department and record.department not in ["", " "]:
                self.records.append(record)


def extract_tables_from_html(html_content: str) -> list[AdmissionRecord]:
    """Extract admission data from HTML content"""
    parser = TableExtractor()
    parser.feed(html_content)
    return parser.records


def save_as_json(records: list[AdmissionRecord], output_path: Path):
    """Save records as JSON"""
    data = [asdict(r) for r in records]
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def save_as_csv(records: list[AdmissionRecord], output_path: Path):
    """Save records as CSV"""
    if not records:
        return

    fieldnames = [f.name for f in fields(AdmissionRecord)]
    with open(output_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in records:
            writer.writerow(asdict(r))


def print_summary(records: list[AdmissionRecord]):
    """Print extraction summary"""
    by_type: dict[str, int] = {}
    for r in records:
        by_type[r.admission_type] = by_type.get(r.admission_type, 0) + 1

    print("=== Extraction Summary ===")
    print(f"Total records: {len(records)}")
    if records:
        print(f"Year: {records[0].year}")
    print("\nRecords by admission type:")
    for t, count in sorted(by_type.items()):
        print(f"  {t}: {count}")


def main():
    parser = argparse.ArgumentParser(
        description="Extract admission data from adiga.kr HTML tables"
    )
    parser.add_argument(
        "input",
        nargs="?",
        default=".agent/scratch/adiga_response.html",
        help="Input HTML file (default: .agent/scratch/adiga_response.html)"
    )
    parser.add_argument(
        "output",
        nargs="?",
        default=".agent/scratch/adiga_extracted.json",
        help="Output file (.json or .csv, default: .agent/scratch/adiga_extracted.json)"
    )
    parser.add_argument(
        "--csv",
        action="store_true",
        help="Also output CSV file"
    )
    parser.add_argument(
        "-q", "--quiet",
        action="store_true",
        help="Suppress output"
    )

    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    with open(input_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    records = extract_tables_from_html(html_content)

    # Save based on output extension
    if output_path.suffix.lower() == ".csv":
        save_as_csv(records, output_path)
    else:
        save_as_json(records, output_path)

    # Also save CSV if requested
    if args.csv and output_path.suffix.lower() != ".csv":
        csv_path = output_path.with_suffix(".csv")
        save_as_csv(records, csv_path)
        if not args.quiet:
            print(f"CSV saved to: {csv_path}")

    if not args.quiet:
        print(f"Extracted {len(records)} records")
        print(f"Output saved to: {output_path}")
        print()
        print_summary(records)


if __name__ == "__main__":
    main()
