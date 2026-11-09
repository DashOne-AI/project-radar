// Repo checks: page JS parses, JSON files parse, versions agree, no personal data in the product.
// Run: node scripts/check.mjs   (extra blocked words: RADAR_BLOCKLIST="word1,word2")
import { readFileSync, readdirSync, statSync, writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = p => readFileSync(join(root, p), "utf8");
const fail = [];

// 1. Page scripts parse
const html = read("artifact/index.html");
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join("\n;\n");
const dir = mkdtempSync(join(tmpdir(), "radar-"));
writeFileSync(join(dir, "page.js"), js);
try { execFileSync(process.execPath, ["--check", join(dir, "page.js")], { stdio: "pipe" }); }
catch (e) { fail.push("artifact/index.html: script does not parse\n" + String(e.stderr || e)); }

// 2. JSON parses
for (const f of [".claude-plugin/plugin.json", ".claude-plugin/marketplace.json", "artifact/capabilities.json", "config/config.schema.json", "config/example.config.json"]) {
  try { JSON.parse(read(f)); } catch (e) { fail.push(`${f}: invalid JSON (${e.message})`); }
}

// 3. Versions agree
const v = JSON.parse(read(".claude-plugin/plugin.json")).version;
const mk = JSON.parse(read(".claude-plugin/marketplace.json"));
const pageV = (html.match(/RADAR_VERSION="([^"]+)"/) || [])[1];
if (mk.metadata.version !== v || mk.plugins[0].version !== v) fail.push(`marketplace.json version differs from plugin.json (${v})`);
if (pageV !== v) fail.push(`RADAR_VERSION in the page (${pageV}) differs from plugin.json (${v})`);
if (!read("CHANGELOG.md").includes(`## ${v}`)) fail.push(`CHANGELOG.md has no entry for ${v}`);

// 4. No instance data in the product
const blocked = [/trig_[A-Za-z0-9]{10,}/, /\b[a-z]{20}\b(?=")/, /@g\.us/, /@s\.whatsapp\.net/,
  ...(process.env.RADAR_BLOCKLIST || "").split(",").filter(Boolean).map(w => new RegExp(w, "i"))];
const walk = d => readdirSync(join(root, d)).flatMap(n => {
  const p = join(d, n);
  if ([".git", "node_modules", "scripts"].includes(n)) return [];
  return statSync(join(root, p)).isDirectory() ? walk(p) : [p];
});
for (const f of walk(".")) {
  if (!/\.(html|md|json|js|mjs|yml)$/.test(f)) continue;
  const t = read(f);
  for (const re of blocked) if (re.test(t)) fail.push(`${f}: matches blocked pattern ${re}`);
}

if (fail.length) { console.error(fail.join("\n")); process.exit(1); }
console.log(`ok  project-radar ${v}`);
