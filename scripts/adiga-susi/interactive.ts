/**
 * Interactive CLI module for reviewing and editing admission records.
 */
import * as readline from "readline";
import type { AdmissionRecord } from "./parse-html";

export interface ReviewSession {
  universityName: string;
  records: AdmissionRecord[];
  deletedIndices: Set<number>;
  currentIndex: number;
}

export interface InteractiveOptions {
  dryRun: boolean;
}

type SummaryAction = "review" | "review-type" | "save" | "skip" | "quit";
type RecordAction =
  | "next"
  | "prev"
  | "delete"
  | "list"
  | "save"
  | "back"
  | "quit"
  | "goto"
  | { type: "edit"; field: number };

export class InteractiveReviewer {
  private rl: readline.Interface;
  private options: InteractiveOptions;

  constructor(options: InteractiveOptions) {
    this.options = options;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Promisified question helper
   */
  private question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Get unique admission types from records
   */
  private getUniqueAdmissionTypes(records: AdmissionRecord[]): string[] {
    const types = new Set<string>();
    for (const r of records) {
      if (r.admissionType) {
        types.add(r.admissionType);
      }
    }
    return Array.from(types).sort();
  }

  /**
   * Count records by admission type
   */
  private countByAdmissionType(
    records: AdmissionRecord[],
    deletedIndices: Set<number>
  ): Record<string, number> {
    const counts: Record<string, number> = {};
    for (let i = 0; i < records.length; i++) {
      if (deletedIndices.has(i)) continue;
      const r = records[i]!;
      const type = r.admissionType || "(no type)";
      counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
  }

  /**
   * Display summary for a university
   */
  public showSummary(session: ReviewSession): void {
    const { universityName, records, deletedIndices } = session;
    const activeCount = records.length - deletedIndices.size;
    const counts = this.countByAdmissionType(records, deletedIndices);

    console.log("\n┌─────────────────────────────────────────────────────────┐");
    console.log(`│ University: ${universityName.padEnd(44)}│`);
    console.log(
      `│ Total Records: ${String(activeCount).padEnd(41)}│`
    );
    if (deletedIndices.size > 0) {
      console.log(
        `│ (${deletedIndices.size} marked for deletion)${" ".repeat(35 - String(deletedIndices.size).length)}│`
      );
    }
    console.log("│                                                         │");
    console.log("│ By Admission Type:                                      │");

    const types = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    types.forEach(([type, count], idx) => {
      const line = `  [${idx + 1}] ${type}: ${count}`;
      console.log(`│${line.padEnd(57)}│`);
    });

    console.log("└─────────────────────────────────────────────────────────┘");
  }

  /**
   * Summary action menu
   */
  public async summaryMenu(session: ReviewSession): Promise<SummaryAction> {
    console.log("\n[r] Review all  [t] Review by type  [s] Save all  [k] Skip  [q] Quit");

    while (true) {
      const input = await this.question("> ");
      const lower = input.toLowerCase();

      switch (lower) {
        case "r":
          return "review";
        case "t":
          return "review-type";
        case "s":
          return "save";
        case "k":
          return "skip";
        case "q":
          return "quit";
        default:
          console.log("Invalid option. Try again.");
      }
    }
  }

  /**
   * Display single record detail view
   */
  public showRecordDetail(session: ReviewSession): void {
    const { records, deletedIndices, currentIndex } = session;
    const record = records[currentIndex]!;
    const isDeleted = deletedIndices.has(currentIndex);
    const activeCount = records.length - deletedIndices.size;

    console.log(
      `\nRecord ${currentIndex + 1}/${records.length}${isDeleted ? " [DELETED]" : ""} (${activeCount} active)`
    );
    console.log("┌───────────────────────────────────────────────────────────┐");
    console.log(
      `│ [1] Year:           ${String(record.year).padEnd(38)}│`
    );
    console.log(
      `│ [2] Admission Type: ${(record.admissionType || "-").padEnd(38)}│`
    );
    console.log(
      `│ [3] Department:     ${(record.departmentName || "-").padEnd(38)}│`
    );
    console.log(
      `│ [4] Quota:          ${String(record.quota ?? "-").padEnd(38)}│`
    );
    console.log(
      `│ [5] Competition:    ${String(record.competitionRate ?? "-").padEnd(38)}│`
    );
    console.log(
      `│ [6] Waitlist Rank:  ${String(record.waitlistRank ?? "-").padEnd(38)}│`
    );
    console.log(
      `│ [7] Cut50:          ${(record.cut50 ?? "-").padEnd(38)}│`
    );
    console.log(
      `│ [8] Cut70:          ${(record.cut70 ?? "-").padEnd(38)}│`
    );
    console.log(
      `│ [9] Subjects:       ${(record.subjects ?? "-").padEnd(38)}│`
    );
    console.log("└───────────────────────────────────────────────────────────┘");
  }

  /**
   * Record actions menu
   */
  public async recordMenu(session: ReviewSession): Promise<RecordAction> {
    const isDeleted = session.deletedIndices.has(session.currentIndex);
    const deleteLabel = isDeleted ? "[u] Undelete" : "[d] Delete";

    console.log(
      `\n[1-9] Edit  [n] Next  [p] Prev  ${deleteLabel}  [l] List  [s] Save  [b] Back  [q] Quit`
    );

    while (true) {
      const input = await this.question("> ");
      const lower = input.toLowerCase();

      // Check for field number
      const fieldNum = parseInt(input, 10);
      if (fieldNum >= 1 && fieldNum <= 9) {
        return { type: "edit", field: fieldNum };
      }

      switch (lower) {
        case "n":
          return "next";
        case "p":
          return "prev";
        case "d":
        case "u":
          return "delete";
        case "l":
          return "list";
        case "s":
          return "save";
        case "b":
          return "back";
        case "q":
          return "quit";
        case "g":
          return "goto";
        default:
          // Check if it's a number for goto
          if (/^\d+$/.test(input)) {
            return "goto";
          }
          console.log("Invalid option. Try again.");
      }
    }
  }

  /**
   * Edit a field in a record
   */
  public async editField(
    record: AdmissionRecord,
    fieldNumber: number,
    allTypes: string[]
  ): Promise<void> {
    const fieldNames: Record<number, keyof AdmissionRecord> = {
      1: "year",
      2: "admissionType",
      3: "departmentName",
      4: "quota",
      5: "competitionRate",
      6: "waitlistRank",
      7: "cut50",
      8: "cut70",
      9: "subjects",
    };

    const fieldName = fieldNames[fieldNumber];
    if (!fieldName) {
      console.log("Invalid field number");
      return;
    }

    const currentValue = record[fieldName];

    console.log(`\nEditing [${fieldNumber}] ${fieldName}`);
    console.log(`Current: ${currentValue ?? "(empty)"}`);

    // Special handling for admission type - show options
    if (fieldName === "admissionType") {
      console.log("\nAvailable types:");
      allTypes.forEach((type, idx) => {
        console.log(`  [${idx + 1}] ${type}`);
      });
      console.log("  [c] Custom value");

      const input = await this.question("\nSelect (Enter to keep current): ");

      if (!input) {
        console.log("Kept current value.");
        return;
      }

      if (input.toLowerCase() === "c") {
        const custom = await this.question("Enter custom value: ");
        if (custom) {
          record.admissionType = custom;
          console.log(`Updated: ${currentValue} → ${custom}`);
        }
        return;
      }

      const idx = parseInt(input, 10) - 1;
      if (idx >= 0 && idx < allTypes.length) {
        const newValue = allTypes[idx]!;
        record.admissionType = newValue;
        console.log(`Updated: ${currentValue} → ${newValue}`);
      } else {
        console.log("Invalid selection. Kept current value.");
      }
      return;
    }

    // Generic field editing
    const input = await this.question("Enter new value (Enter to keep): ");

    if (!input) {
      console.log("Kept current value.");
      return;
    }

    // Type-specific parsing
    if (fieldName === "year" || fieldName === "quota" || fieldName === "waitlistRank") {
      const numValue = parseInt(input, 10);
      if (isNaN(numValue)) {
        console.log("Invalid number. Kept current value.");
        return;
      }
      (record as Record<string, unknown>)[fieldName] = numValue;
      console.log(`Updated: ${currentValue} → ${numValue}`);
    } else if (fieldName === "competitionRate") {
      const numValue = parseFloat(input);
      if (isNaN(numValue)) {
        console.log("Invalid number. Kept current value.");
        return;
      }
      record.competitionRate = numValue;
      console.log(`Updated: ${currentValue} → ${numValue}`);
    } else {
      // String fields
      (record as Record<string, unknown>)[fieldName] = input || null;
      console.log(`Updated: ${currentValue} → ${input}`);
    }
  }

  /**
   * Show list view of records
   */
  public showListView(
    session: ReviewSession,
    page: number,
    pageSize: number = 10
  ): { totalPages: number } {
    const { records, deletedIndices } = session;
    const startIdx = page * pageSize;
    const endIdx = Math.min(startIdx + pageSize, records.length);
    const totalPages = Math.ceil(records.length / pageSize);

    console.log(
      `\nRecords ${startIdx + 1}-${endIdx} of ${records.length} (Page ${page + 1}/${totalPages})`
    );
    console.log(
      "┌────┬────────────────────────────┬──────┬───────┬────────┬────────┬────────┐"
    );
    console.log(
      "│ #  │ Department                 │ Year │ Quota │ Comp.  │ Cut50  │ Cut70  │"
    );
    console.log(
      "├────┼────────────────────────────┼──────┼───────┼────────┼────────┼────────┤"
    );

    for (let i = startIdx; i < endIdx; i++) {
      const r = records[i]!;
      const isDeleted = deletedIndices.has(i);
      const marker = isDeleted ? "*" : " ";
      const dept = (r.departmentName || "-").slice(0, 26).padEnd(26);
      const year = String(r.year).padEnd(4);
      const quota = String(r.quota ?? "-").padEnd(5);
      const comp = String(r.competitionRate ?? "-").slice(0, 6).padEnd(6);
      const cut50 = (r.cut50 ?? "-").slice(0, 6).padEnd(6);
      const cut70 = (r.cut70 ?? "-").slice(0, 6).padEnd(6);

      console.log(
        `│${marker}${String(i + 1).padStart(3)}│ ${dept} │ ${year} │ ${quota} │ ${comp} │ ${cut50} │ ${cut70} │`
      );
    }

    console.log(
      "└────┴────────────────────────────┴──────┴───────┴────────┴────────┴────────┘"
    );

    if (deletedIndices.size > 0) {
      console.log(`* = marked for deletion (${deletedIndices.size} total)`);
    }

    return { totalPages };
  }

  /**
   * List view navigation
   */
  public async listViewMenu(
    session: ReviewSession,
    currentPage: number,
    totalPages: number
  ): Promise<{ action: "next" | "prev" | "select" | "back"; value?: number }> {
    console.log("\n[n] Next page  [p] Prev page  [#] Select record  [b] Back");

    while (true) {
      const input = await this.question("> ");
      const lower = input.toLowerCase();

      if (lower === "n") {
        return { action: currentPage < totalPages - 1 ? "next" : "next" };
      }
      if (lower === "p") {
        return { action: currentPage > 0 ? "prev" : "prev" };
      }
      if (lower === "b") {
        return { action: "back" };
      }

      const num = parseInt(input, 10);
      if (!isNaN(num) && num >= 1 && num <= session.records.length) {
        return { action: "select", value: num - 1 };
      }

      console.log("Invalid option. Try again.");
    }
  }

  /**
   * Confirmation prompt
   */
  public async confirm(message: string): Promise<boolean> {
    const input = await this.question(`${message} [y/n]: `);
    return input.toLowerCase() === "y";
  }

  /**
   * Main review flow for a university
   */
  public async reviewUniversity(
    universityName: string,
    records: AdmissionRecord[]
  ): Promise<{ records: AdmissionRecord[]; action: "save" | "skip" | "quit" }> {
    const session: ReviewSession = {
      universityName,
      records: [...records], // Make a copy to allow modifications
      deletedIndices: new Set(),
      currentIndex: 0,
    };

    const allTypes = this.getUniqueAdmissionTypes(records);

    // Main loop
    while (true) {
      this.showSummary(session);
      const summaryAction = await this.summaryMenu(session);

      switch (summaryAction) {
        case "save": {
          const activeRecords = session.records.filter(
            (_, i) => !session.deletedIndices.has(i)
          );
          const saveMsg = this.options.dryRun
            ? `[DRY RUN] Would save ${activeRecords.length} records?`
            : `Save ${activeRecords.length} records to database?`;

          if (await this.confirm(saveMsg)) {
            return { records: activeRecords, action: "save" };
          }
          break;
        }

        case "skip":
          if (await this.confirm("Skip this university?")) {
            return { records: [], action: "skip" };
          }
          break;

        case "quit":
          if (await this.confirm("Quit without saving?")) {
            return { records: [], action: "quit" };
          }
          break;

        case "review":
          session.currentIndex = 0;
          await this.reviewRecordsLoop(session, allTypes);
          break;

        case "review-type": {
          const types = Object.keys(
            this.countByAdmissionType(session.records, session.deletedIndices)
          );
          console.log("\nSelect admission type to review:");
          types.forEach((type, idx) => {
            console.log(`  [${idx + 1}] ${type}`);
          });

          const typeInput = await this.question("> ");
          const typeIdx = parseInt(typeInput, 10) - 1;
          if (typeIdx >= 0 && typeIdx < types.length) {
            const selectedType = types[typeIdx]!;
            // Find first record of this type
            const firstIdx = session.records.findIndex(
              (r, i) =>
                !session.deletedIndices.has(i) && r.admissionType === selectedType
            );
            if (firstIdx !== -1) {
              session.currentIndex = firstIdx;
              await this.reviewRecordsLoop(session, allTypes, selectedType);
            }
          } else {
            console.log("Invalid selection.");
          }
          break;
        }
      }
    }
  }

  /**
   * Record review loop
   */
  private async reviewRecordsLoop(
    session: ReviewSession,
    allTypes: string[],
    filterType?: string
  ): Promise<void> {
    while (true) {
      // Find valid index for filtered view
      if (filterType) {
        while (
          session.currentIndex < session.records.length &&
          session.records[session.currentIndex]!.admissionType !== filterType
        ) {
          session.currentIndex++;
        }
        if (session.currentIndex >= session.records.length) {
          console.log("\nNo more records of this type.");
          break;
        }
      }

      this.showRecordDetail(session);
      const action = await this.recordMenu(session);

      if (typeof action === "object" && action.type === "edit") {
        await this.editField(
          session.records[session.currentIndex]!,
          action.field,
          allTypes
        );
        continue;
      }

      switch (action) {
        case "next":
          if (session.currentIndex < session.records.length - 1) {
            session.currentIndex++;
          } else {
            console.log("Already at last record.");
          }
          break;

        case "prev":
          if (session.currentIndex > 0) {
            session.currentIndex--;
            // If filtered, find previous matching record
            if (filterType) {
              while (
                session.currentIndex > 0 &&
                session.records[session.currentIndex]!.admissionType !== filterType
              ) {
                session.currentIndex--;
              }
            }
          } else {
            console.log("Already at first record.");
          }
          break;

        case "delete":
          if (session.deletedIndices.has(session.currentIndex)) {
            session.deletedIndices.delete(session.currentIndex);
            console.log("Record unmarked for deletion.");
          } else {
            session.deletedIndices.add(session.currentIndex);
            console.log("Record marked for deletion.");
          }
          break;

        case "list": {
          let currentPage = Math.floor(session.currentIndex / 10);
          while (true) {
            const { totalPages } = this.showListView(session, currentPage);
            const listAction = await this.listViewMenu(
              session,
              currentPage,
              totalPages
            );

            if (listAction.action === "back") {
              break;
            } else if (listAction.action === "next" && currentPage < totalPages - 1) {
              currentPage++;
            } else if (listAction.action === "prev" && currentPage > 0) {
              currentPage--;
            } else if (listAction.action === "select" && listAction.value !== undefined) {
              session.currentIndex = listAction.value;
              break;
            }
          }
          break;
        }

        case "goto": {
          const input = await this.question("Go to record number: ");
          const num = parseInt(input, 10);
          if (num >= 1 && num <= session.records.length) {
            session.currentIndex = num - 1;
          } else {
            console.log("Invalid record number.");
          }
          break;
        }

        case "save":
        case "back":
        case "quit":
          return;
      }
    }
  }

  /**
   * Cleanup readline interface
   */
  public close(): void {
    this.rl.close();
  }
}
