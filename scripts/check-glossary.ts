import fs from "fs";
import path from "path";

// Banned words as documented in GLOSSARY.md
// Targets domain terminology violations across both code identifiers and UI prose (English & Indonesian)
const BANNED_TERMS = [
  { banned: /\b(client|klien)(Name|Pic|Email|Address|Id|Type|Data)?\b/i, canonical: "Customer / Pelanggan", avoid: "client / klien" },
  { banned: /\bbuyer\b/i, canonical: "Customer / Pelanggan", avoid: "buyer" },
  { banned: /\bfacility\b/i, canonical: "Location / Lokasi", avoid: "facility" },
];

function checkDirectory(dir: string, violations: string[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git" && entry.name !== "dist") {
        checkDirectory(fullPath, violations);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, lineNum) => {
        // Skip comment lines or external library package paths
        if (line.trim().startsWith("//") || line.trim().startsWith("/*")) return;
        if (/import .* from ["'].*client["']/i.test(line)) return;

        for (const term of BANNED_TERMS) {
          if (term.banned.test(line)) {
            // Permit technical auth client identifiers
            if (/authClient|createAuthClient|queryClient|clientSide/i.test(line)) continue;

            violations.push(
              `${fullPath}:${lineNum + 1} - Found banned domain term "${term.avoid}". Use canonical "${term.canonical}" instead.`
            );
          }
        }
      });
    }
  }
}

const violations: string[] = [];
checkDirectory(path.resolve(process.cwd(), "src"), violations);

if (violations.length > 0) {
  console.error("❌ GLOSSARY.md mechanical compliance check failed:\n");
  violations.forEach((v) => console.error(`  ${v}`));
  console.error("\nPlease replace banned terms with their canonical domain vocabulary.");
  process.exit(1);
} else {
  console.log("✅ GLOSSARY domain vocabulary verified clean (including Indonesian terms).");
}
