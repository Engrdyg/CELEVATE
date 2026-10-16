import fs from "node:fs";
import path from "node:path";

export const BANK_DIR = path.join(process.cwd(), "data", "question-bank");
export const BANK_FILES = {
  mste: "mathematics-surveying-transportation.json",
  hge: "hydraulics-geotechnical.json",
  psad: "structural-analysis-design.json",
} as const;

export function readBankFiles(only?: string[]) {
  return Object.entries(BANK_FILES)
    .filter(([s]) => !only || only.includes(s))
    .map(([subject, file]) => {
      const p = path.join(BANK_DIR, file);
      return { subject, file, path: p, raw: fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null };
    });
}
