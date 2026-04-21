import { readdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const shouldDelete = process.argv.includes("--delete");
const ignoredDirs = new Set([
  ".git",
  "node_modules",
  "dist",
  "logs",
  "src-tauri/target",
  "src-tauri/gen"
]);
const orphanExtensions = new Set([".tmp", ".temp", ".bak", ".old", ".orig", ".rej"]);

async function walk(current) {
  const entries = await readdir(current, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    const relative = path.relative(root, absolute).replaceAll("\\", "/");

    if (entry.isDirectory()) {
      if (ignoredDirs.has(relative) || ignoredDirs.has(entry.name)) {
        continue;
      }
      results.push(...(await walk(absolute)));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (orphanExtensions.has(ext)) {
      results.push(relative);
    }
  }

  return results;
}

const found = await walk(root);

console.log("=== Aegis Vault Orphan Report ===");
console.log("");
if (!found.length) {
  console.log("No se detectaron archivos huerfanos con las extensiones configuradas.");
  process.exit(0);
}

for (const file of found) {
  console.log(` - ${file}`);
}

if (shouldDelete) {
  for (const relative of found) {
    await rm(path.join(root, relative), { force: true });
  }
  console.log("");
  console.log(`Eliminados ${found.length} archivo(s) huerfano(s).`);
} else {
  console.log("");
  console.log(`Detectados ${found.length} archivo(s). Usa --delete para limpiarlos.`);
}
