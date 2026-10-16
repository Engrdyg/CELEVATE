import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { questionSchema, type Question } from "@/lib/qbank/schema";
import { BANK_FILES } from "@/lib/server/qbank/file-store";

export const BANK_DIR = path.join(__dirname, "..", "data", "question-bank");

export function loadBank(): Question[] {
  return Object.values(BANK_FILES).flatMap((f) => {
    const data = JSON.parse(fs.readFileSync(path.join(BANK_DIR, f), "utf8"));
    return data.questions.map((q: unknown) => questionSchema.parse(q));
  });
}

/** Copies the bank into a temp dir so write tests never touch the real files. */
export function tempBank() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "celevate-bank-"));
  for (const f of Object.values(BANK_FILES)) fs.copyFileSync(path.join(BANK_DIR, f), path.join(dir, f));
  fs.mkdirSync(path.join(dir, "reports"));
  return { dir, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}
