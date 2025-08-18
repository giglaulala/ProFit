import { copy, ensureDir } from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../");

const srcAssets = path.join(repoRoot, "assets");
const destAssets = path.join(repoRoot, "web", "public", "assets");

async function main() {
  await ensureDir(destAssets);
  await copy(srcAssets, destAssets);
  console.log("Assets synced to web/public/assets");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
