import fs from "fs";
import path from "path";

// Mechanical verification for frontend anti-slop & Tailwind v3 rules
// Prevents:
// 1. Re-emergence of legacy dark AI-slop colors (#06090e, #0b111c, #06b6d4, etc.) in UI pages
// 2. Non-existent Tailwind v4 classes (shadow-xs, backdrop-blur-xs, etc.)
// 3. Views without semantic <section> tags

const BANNED_COLOR_PATTERNS = [
  { pattern: /#06090e/i, desc: "Legacy Deep Cold dark background (#06090e)" },
  { pattern: /#0b111c/i, desc: "Legacy Arctic dark surface (#0b111c)" },
  { pattern: /#06b6d4/i, desc: "Legacy AI-slop neon cyan (#06b6d4)" },
  { pattern: /\bshadow-glow-cold\b/, desc: "Legacy cyberpunk glow (shadow-glow-cold)" },
  { pattern: /\bshadow-(teal|cyan)-\d+\b/, desc: "Legacy neon cyan/teal glow shadow (use neutral 'shadow-sm' or 'shadow-blue-500/10')" },
  { pattern: /\bshadow-xs\b/, desc: "Non-existent Tailwind v4 class 'shadow-xs' (use 'shadow-sm' or 'shadow')" },
  { pattern: /\bbackdrop-blur-xs\b/, desc: "Non-existent Tailwind v4 class 'backdrop-blur-xs' (use 'backdrop-blur-sm')" },
];

function checkServerSecurity(dir: string, violations: string[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      checkServerSecurity(fullPath, violations);
    } else if (/\.(ts|js)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, lineNum) => {
        if (line.trim().startsWith("//") || line.trim().startsWith("/*")) return;

        // Prevent fail-open role fallback: e.g. user.role || 'technician' or user.role || "admin"
        if (/\.role\s*\|\|\s*["'](technician|admin)["']/.test(line)) {
          violations.push(
            `${fullPath}:${lineNum + 1} - Found fail-open role fallback: role resolution must fail closed (403 Forbidden).`
          );
        }
      });
    }
  }
}

function checkFrontendIntegrity(dir: string, violations: string[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git" && entry.name !== "dist") {
        checkFrontendIntegrity(fullPath, violations);
      }
    } else if (/\.(tsx|jsx|css)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, lineNum) => {
        if (line.trim().startsWith("//") || line.trim().startsWith("/*")) return;

        for (const item of BANNED_COLOR_PATTERNS) {
          if (item.pattern.test(line)) {
            violations.push(
              `${fullPath}:${lineNum + 1} - Found prohibited pattern: ${item.desc}`
            );
          }
        }
      });

      // Semantic check: Major views in pages/ must contain at least one <section tag
      if (fullPath.includes(path.join("pages")) && entry.name.endsWith("View.tsx")) {
        if (!content.includes("<section")) {
          violations.push(
            `${fullPath} - View is missing semantic <section> tag (violates AGENTS.md Rule 5)`
          );
        }
      }
    }
  }
}

const violations: string[] = [];
checkFrontendIntegrity(path.resolve(process.cwd(), "src", "client"), violations);
checkServerSecurity(path.resolve(process.cwd(), "src", "server"), violations);

if (violations.length > 0) {
  console.error("❌ Guardrail Check failed:\n");
  violations.forEach((v) => console.error(`  • ${v}`));
  console.error("\nPlease follow the Clean B2B Standard & Security Guidelines documented in AGENTS.md.\n");
  process.exit(1);
} else {
  console.log("✅ Frontend UI standards & Server RBAC integrity verified clean.");
}
