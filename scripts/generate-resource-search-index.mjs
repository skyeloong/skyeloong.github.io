import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directories = ["resources", "zh/resources"];

const decodeEntities = (text) => text
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">");

const extractText = (html) => {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  return decodeEntities(main
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
};

const index = {};

for (const directory of directories) {
  const files = (await readdir(path.join(root, directory)))
    .filter((file) => file.endsWith(".html"))
    .sort();

  for (const file of files) {
    const relativePath = `${directory}/${file}`;
    const html = await readFile(path.join(root, relativePath), "utf8");
    index[`/${relativePath}`] = extractText(html);
  }
}

await writeFile(
  path.join(root, "resource-search-index.json"),
  `${JSON.stringify(index)}\n`,
  "utf8"
);

console.log(`Indexed ${Object.keys(index).length} resource pages.`);
