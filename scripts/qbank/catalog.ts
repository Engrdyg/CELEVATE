/** Regenerates lib/qbank/catalog.generated.json (answer-free metadata of published questions). */
import fs from "node:fs";
import path from "node:path";
import { FileStore } from "@/lib/server/qbank/file-store";
import { toCatalog } from "@/lib/server/qbank/catalog";

async function main() {
  const store = new FileStore();
  const catalog = toCatalog(await store.all());
  const out = path.join(process.cwd(), "lib", "qbank", "catalog.generated.json");
  fs.writeFileSync(out, JSON.stringify(catalog, null, 1) + "\n");
  console.log(`catalog: ${catalog.length} published questions → ${path.relative(process.cwd(), out)}`);
}
main();
