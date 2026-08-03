import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import process from "node:process";

const root = process.cwd();
const messagesDir = join(root, "messages");
const ignoredDirectories = new Set([".git", ".next", "node_modules"]);
const checkedExtensions = new Set([
  ".css",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
]);

const suspiciousSequences = [
  ["replacement character", /\uFFFD/u],
  ["UTF-8 mojibake", /\u00c3\u0192|\u00c3\u201e|\u00c3\u2026|\u00c3\u201a/u],
];
const wordInternalQuestionMark =
  /[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N}'’.-]*\?[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N}'’.-]*/gu;

const failures = [];

for (const file of listFiles(root)) {
  const content = readFileSync(file, "utf8");

  for (const [label, pattern] of suspiciousSequences) {
    if (pattern.test(content)) {
      failures.push(`${toProjectPath(file)} contains ${label}.`);
    }
  }
}

for (const file of readdirSync(messagesDir)
  .filter((name) => name.endsWith(".json"))
  .sort()) {
  const messages = JSON.parse(readFileSync(join(messagesDir, file), "utf8"));
  walkMessages(messages, file, "");
}

if (failures.length > 0) {
  console.error("Encoding validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Encoding validation passed.");

function listFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;

    const fullPath = join(directory, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...listFiles(fullPath));
      continue;
    }

    if (checkedExtensions.has(getExtension(entry))) {
      files.push(fullPath);
    }
  }

  return files;
}

function walkMessages(value, file, pointer) {
  if (typeof value === "string") {
    const matches = value.match(wordInternalQuestionMark);

    if (matches) {
      failures.push(
        `messages/${file} ${pointer} has suspicious question mark(s): ${matches.join(", ")}`,
      );
    }

    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      walkMessages(item, file, `${pointer}[${index}]`),
    );
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      walkMessages(item, file, pointer ? `${pointer}.${key}` : key);
    }
  }
}

function getExtension(file) {
  const index = file.lastIndexOf(".");
  return index === -1 ? "" : file.slice(index);
}

function toProjectPath(file) {
  return relative(root, file).replaceAll("\\", "/");
}
