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

      // Verify that all sensitive routes enforce wildcards or requireRole
      if (fullPath.includes(path.join("routes")) && (entry.name === "invoices.ts" || entry.name === "settings.ts")) {
        if (!content.includes('use("*", requireRole(["admin"]))')) {
          violations.push(
            `${fullPath} - Sensitive admin router must protect all subpaths using: router.use("*", requireRole(["admin"]))`
          );
        }
      }

      lines.forEach((line, lineNum) => {
        if (line.trim().startsWith("//") || line.trim().startsWith("/*")) return;

        // Prevent fail-open role fallback: e.g. user.role || 'technician' or user.role || "admin"
        if (/\.role\s*\|\|\s*["'](technician|admin)["']/.test(line)) {
          violations.push(
            `${fullPath}:${lineNum + 1} - Found fail-open role fallback: role resolution must fail closed (403 Forbidden).`
          );
        }

        // Prevent un-abstracted raw Resend fetch calls in routes/controllers
        if (line.includes("https://api.resend.com/emails") && !fullPath.includes(path.join("services", "email.ts"))) {
          violations.push(
            `${fullPath}:${lineNum + 1} - Direct fetch to Resend API is banned. Use 'sendTransactionalEmail' from services/email.`
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

        // Prevent pseudo 1x1 mock base64 images in production field evidence
        if (/data:image\/(png|jpeg|webp);base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB/i.test(line)) {
          violations.push(
            `${fullPath}:${lineNum + 1} - Found pseudo 1x1 dummy base64 signature/photo. Must use real HTML5 canvas or actual file uploads.`
          );
        }

        // Prevent false-positive notification delivery status: marking SENT without verifying data.success
        if (line.includes('status: "SENT"') || line.includes("status: 'SENT'")) {
          const start = Math.max(0, lineNum - 12);
          const block = lines.slice(start, lineNum).join("\n");
          if (block.includes("if (res.ok)") && !block.includes("data.success")) {
            violations.push(
              `${fullPath}:${lineNum + 1} - Found false-positive delivery check: must verify 'res.ok && data.success === true' before marking SENT.`
            );
          }
        }

        // Prevent ad-hoc split("/ac/") URL parsing: must use 'parseAssetTagFromUrl' from client/lib/scanner
        if (line.includes('.split("/ac/")') && !fullPath.includes(path.join("lib", "scanner.ts"))) {
          violations.push(
            `${fullPath}:${lineNum + 1} - Direct string splitting on '/ac/' is banned. Use 'parseAssetTagFromUrl' from client/lib/scanner.`
          );
        }

        // Prevent modal overlay without role="dialog" accessibility attribute
        if (line.includes("fixed inset-0") && !content.includes('role="dialog"') && !content.includes("role='dialog'")) {
          violations.push(
            `${fullPath}:${lineNum + 1} - Modal/Dialog overlay (fixed inset-0) is missing accessible 'role="dialog"' attribute.`
          );
        }

        // Enforce 48px field touch target standards on stepper buttons in field flow
        if (entry.name === "FieldTrackingView.tsx" && (line.includes("Kurangi ") || line.includes("Tambah "))) {
          const surroundingBlock = lines.slice(Math.max(0, lineNum - 3), Math.min(lines.length, lineNum + 4)).join(" ");
          if (!surroundingBlock.includes("min-w-[48px]") && !surroundingBlock.includes("w-12")) {
            violations.push(
              `${fullPath}:${lineNum + 1} - Field stepper action must maintain a minimum 48px touch target (w-12 h-12 or min-w-[48px] min-h-[48px]) per ADR-0008.`
            );
          }
        }
      });

      // Enforce numerical keypad optimization in field telemetry inputs
      if (entry.name === "FieldTrackingView.tsx") {
        if (!content.includes('inputMode="decimal"')) {
          violations.push(
            `${fullPath} - Field telemetry forms must specify inputMode="decimal" to invoke numeric mobile keypads per ADR-0008.`
          );
        }
      }

      // Semantic check: Major views in pages/ must contain semantic <section> tag and must NOT declare nested <main>
      if (fullPath.includes(path.join("pages")) && entry.name.endsWith("View.tsx")) {
        if (!content.includes("<section")) {
          violations.push(
            `${fullPath} - View is missing semantic <section> tag (violates AGENTS.md Rule 5)`
          );
        }
        if (content.includes("<main")) {
          violations.push(
            `${fullPath} - Nested <main> tag detected in view. Primary <main> container must reside only in App.tsx (violates AGENTS.md Rule 5).`
          );
        }
      }
    }
  }
}

const violations: string[] = [];

// Mechanical check 1: Pure TypeScript rule (no raw .js/.jsx in root, src, scripts, docs)
function checkPureTypeScript(violations: string[]) {
  const rootDir = process.cwd();
  const checkedDirs = ["src", "scripts", "docs"];
  
  for (const d of checkedDirs) {
    const dirPath = path.join(rootDir, d);
    if (!fs.existsSync(dirPath)) continue;
    const scanDir = (curr: string) => {
      const items = fs.readdirSync(curr, { withFileTypes: true });
      for (const item of items) {
        const full = path.join(curr, item.name);
        if (item.isDirectory()) {
          scanDir(full);
        } else if (/\.(js|jsx|mjs|cjs)$/.test(item.name)) {
          violations.push(
            `${full} - Found raw JavaScript file. All code and scripts must be TypeScript (.ts / .tsx).`
          );
        }
      }
    };
    scanDir(dirPath);
  }

  // Also check root directory for loose .js files (e.g. tailwind.config.js, postcss.config.js)
  const rootItems = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const item of rootItems) {
    if (!item.isDirectory() && /\.(js|jsx|mjs|cjs)$/.test(item.name)) {
      violations.push(
        `${path.join(rootDir, item.name)} - Found raw JavaScript file in repository root. All config files must be TypeScript.`
      );
    }
  }
}

// Mechanical check 2: GitHub Linguist hygiene (.gitattributes must mark agent skills & vendored assets)
function checkLinguistHygiene(violations: string[]) {
  const gitattributesPath = path.join(process.cwd(), ".gitattributes");
  if (!fs.existsSync(gitattributesPath)) {
    violations.push(".gitattributes is missing. Must exist to protect GitHub language statistics.");
    return;
  }
  const content = fs.readFileSync(gitattributesPath, "utf-8");
  if (!content.includes(".agents/** linguist-vendored")) {
    violations.push(".gitattributes must include '.agents/** linguist-vendored' to ignore AI skills from repository language stats.");
  }
}

checkPureTypeScript(violations);
checkLinguistHygiene(violations);
checkFrontendIntegrity(path.resolve(process.cwd(), "src", "client"), violations);
checkServerSecurity(path.resolve(process.cwd(), "src", "server"), violations);

if (violations.length > 0) {
  console.error("❌ Guardrail Check failed:\n");
  violations.forEach((v) => console.error(`  • ${v}`));
  console.error("\nPlease follow the Clean B2B Standard & Security Guidelines documented in AGENTS.md.\n");
  process.exit(1);
} else {
  console.log("✅ Frontend UI standards, Server RBAC, Pure TypeScript & Linguist hygiene verified clean.");
}
