import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const messagesDir = path.join(process.cwd(), "messages");
const baseLocale = "en";
const baseMessages = readJson(`${baseLocale}.json`);
const localeFiles = fs
  .readdirSync(messagesDir)
  .filter((file) => file.endsWith(".json"))
  .sort();

let hasError = false;

for (const file of localeFiles) {
  if (file === `${baseLocale}.json`) continue;

  const localeMessages = readJson(file);
  const locale = path.basename(file, ".json");
  const missing = [];
  const extra = [];
  const typeMismatches = [];

  compareShape(baseMessages, localeMessages, locale, "", {
    missing,
    extra,
    typeMismatches,
  });

  if (missing.length || extra.length || typeMismatches.length) {
    hasError = true;
    console.error(`\n${locale}: translation shape mismatch`);
    printList("Missing keys", missing);
    printList("Extra keys", extra);
    printList("Type mismatches", typeMismatches);
  }
}

if (hasError) {
  process.exitCode = 1;
} else {
  console.log("Translation files match the en.json schema.");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(messagesDir, file), "utf8"));
}

function compareShape(base, target, locale, prefix, result) {
  const baseType = getType(base);
  const targetType = getType(target);

  if (baseType !== targetType) {
    result.typeMismatches.push(
      `${prefix || "<root>"}: en is ${baseType}, ${locale} is ${targetType}`,
    );
    return;
  }

  if (baseType !== "object") return;

  const baseKeys = Object.keys(base);
  const targetKeys = Object.keys(target);

  for (const key of baseKeys) {
    const nextPath = prefix ? `${prefix}.${key}` : key;

    if (!(key in target)) {
      result.missing.push(nextPath);
      continue;
    }

    compareShape(base[key], target[key], locale, nextPath, result);
  }

  for (const key of targetKeys) {
    if (!(key in base)) {
      result.extra.push(prefix ? `${prefix}.${key}` : key);
    }
  }
}

function getType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function printList(title, items) {
  if (!items.length) return;
  console.error(`  ${title}:`);
  for (const item of items) {
    console.error(`    - ${item}`);
  }
}
