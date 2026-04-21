import { rm, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const targets = [
  "dist",
  "src-tauri/target",
  "src-tauri/gen",
  "node_modules/.vite"
];

const removed = [];
const missing = [];

for (const relative of targets) {
  const absolute = path.join(root, relative);
  try {
    await stat(absolute);
    await rm(absolute, { recursive: true, force: true });
    removed.push(relative);
  } catch {
    missing.push(relative);
  }
}

console.log("=== Aegis Vault Clean Report ===");
console.log("");
console.log("Removed:");
for (const entry of removed) {
  console.log(`  - ${entry}`);
}
if (!removed.length) {
  console.log("  - nothing removed");
}
console.log("");
console.log("Skipped:");
for (const entry of missing) {
  console.log(`  - ${entry}`);
}
if (!missing.length) {
  console.log("  - nothing skipped");
}
