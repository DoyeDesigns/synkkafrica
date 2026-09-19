import fs from "node:fs";
import path from "node:path";

function parseTsCatalog(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const flat = {};
  const re =
    /"([^"]+)"\s*:\s*("((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|`((?:\\.|[^`\\])*)`)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const key = m[1];
    let val = m[3] ?? m[4] ?? m[5] ?? "";
    val = val
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\");
    flat[key] = val;
  }
  return flat;
}

function nestFlat(flat) {
  const result = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let cur = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (typeof cur[p] !== "object" || cur[p] === null) cur[p] = {};
      cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
  }
  return result;
}

const locales = ["en", "fr", "es", "de"];
const dir = path.join("src", "lib", "preferences", "translations");
const outDir = "messages";
fs.mkdirSync(outDir, { recursive: true });

for (const loc of locales) {
  const flat = parseTsCatalog(path.join(dir, `${loc}.ts`));
  const nested = nestFlat(flat);
  fs.writeFileSync(
    path.join(outDir, `${loc}.json`),
    `${JSON.stringify(nested, null, 2)}\n`,
    "utf8",
  );
  console.log(loc, "keys", Object.keys(flat).length);
}
