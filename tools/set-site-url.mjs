// Run once the final public address is known:
//   node tools/set-site-url.mjs https://example.com/
// Writes the canonical and sharing tags in index.html, sitemap.xml and robots.txt.
// Safe to run again if the address changes.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let url;
try {
  url = new URL(process.argv[2]);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
} catch {
  console.error("Usage: node tools/set-site-url.mjs https://example.com/");
  process.exit(1);
}
const site = url.href.endsWith("/") ? url.href : `${url.href}/`;
const image = `${site}assets/og/og-image.png`;

const indexPath = join(root, "index.html");
const html = readFileSync(indexPath, "utf8");
const block = /(<!-- site-url:start[^\n]*-->\r?\n)[\s\S]*?(\s*<!-- site-url:end -->)/;
if (!block.test(html)) {
  console.error("Could not find the site-url markers in index.html.");
  process.exit(1);
}
const tags = [
  `<link rel="canonical" href="${site}">`,
  `<meta property="og:url" content="${site}">`,
  `<meta property="og:image" content="${image}">`,
  `<meta name="twitter:image" content="${image}">`,
].map((tag) => `  ${tag}`).join("\n");
writeFileSync(indexPath, html.replace(block, `$1${tags}$2`));

writeFileSync(join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}</loc>
  </url>
</urlset>
`);

writeFileSync(join(root, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${site}sitemap.xml
`);

console.log(`Site address set to ${site}`);
