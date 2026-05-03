const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist");
const files = [
  "index.html",
  "styles.css",
  "app.js",
  "app-data.js",
  "app-logic.js",
  "manifest.webmanifest",
  "icon.svg",
  "sw.js"
];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(outDir, file));
}

fs.writeFileSync(
  path.join(outDir, "_headers"),
  [
    "/*",
    "  X-Content-Type-Options: nosniff",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "  Permissions-Policy: geolocation=(), microphone=(), camera=()",
    "",
    "/sw.js",
    "  Cache-Control: no-cache",
    "",
    "/manifest.webmanifest",
    "  Cache-Control: no-cache"
  ].join("\n"),
  "utf8"
);

console.log(`Built Cloudflare Pages assets in ${path.relative(root, outDir)}`);
