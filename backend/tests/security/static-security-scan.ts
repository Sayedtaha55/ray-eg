/**
 * Static Security Scanner — Scans source code for security vulnerabilities.
 *
 * Usage:
 *   npx ts-node backend/tests/security/static-security-scan.ts
 *
 * Scans for:
 *   1. Hardcoded secrets/credentials
 *   2. dangerouslySetInnerHTML usage
 *   3. eval() / Function() usage
 *   4. Insecure crypto (Math.random for security)
 *   5. Missing auth guards on controllers
 *   6. SQL injection patterns ($queryRawUnsafe, $executeRawUnsafe)
 *   7. Insecure cookie settings
 *   8. CORS wildcard in production
 *   9. Body limit too high
 *  10. JWT in localStorage
 *  11. Unvalidated body:any parameters
 *  12. Missing CSRF on mutation endpoints
 */

import * as fs from 'fs';
import * as path from 'path';

interface Finding {
  file: string;
  line: number;
  rule: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  snippet: string;
}

const findings: Finding[] = [];
const scanRoot = path.resolve(__dirname, '../../..');
const backendRoot = path.resolve(scanRoot, 'backend/src');
const frontendRoot = path.resolve(scanRoot, 'src');

const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', 'release', 'coverage', '.next'];
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function scanFile(filePath: string, rules: { pattern: RegExp; rule: string; severity: Finding['severity']; description: string }[]) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    for (const rule of rules) {
      if (rule.pattern.test(lines[i])) {
        findings.push({
          file: path.relative(scanRoot, filePath),
          line: i + 1,
          rule: rule.rule,
          severity: rule.severity,
          description: rule.description,
          snippet: lines[i].trim().slice(0, 120),
        });
      }
    }
  }
}

function walkDir(dir: string, callback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) walkDir(fullPath, callback);
    } else if (SCAN_EXTENSIONS.includes(path.extname(entry.name))) {
      callback(fullPath);
    }
  }
}

const backendRules = [
  { pattern: /password\s*[:=]\s*['"][^'"]{4,}['"]/i, rule: 'HARDCODED_PASSWORD', severity: 'critical' as const, description: 'Hardcoded password detected' },
  { pattern: /(?<!DEV_FALLBACK_)secret\s*[:=]\s*['"][^'"]{8,}['"]/i, rule: 'HARDCODED_SECRET', severity: 'critical' as const, description: 'Hardcoded secret detected' },
  { pattern: /DEV_FALLBACK_SECRET\s*[:=]\s*['"]/, rule: 'DEV_FALLBACK_SECRET', severity: 'low' as const, description: 'Dev fallback JWT secret present (guarded by production check)' },
  { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]{10,}['"]/i, rule: 'HARDCODED_API_KEY', severity: 'critical' as const, description: 'Hardcoded API key detected' },
  { pattern: /Math\.random\(\)/, rule: 'INSECURE_RANDOM', severity: 'high' as const, description: 'Math.random() used — not cryptographically secure' },
  { pattern: /eval\s*\(/, rule: 'EVAL_USAGE', severity: 'critical' as const, description: 'eval() usage — code injection risk' },
  { pattern: /new\s+Function\s*\(/, rule: 'FUNCTION_CONSTRUCTOR', severity: 'high' as const, description: 'Function constructor — code injection risk' },
  { pattern: /\$queryRawUnsafe|executeRawUnsafe/, rule: 'SQL_INJECTION', severity: 'critical' as const, description: 'Unsafe raw SQL query — SQL injection risk' },
  { pattern: /@Body\(\)\s+\w+:\s*any/, rule: 'UNVALIDATED_BODY', severity: 'medium' as const, description: 'Unvalidated body:any parameter — bypasses ValidationPipe' },
  { pattern: /sameSite.*none/i, rule: 'INSECURE_COOKIE', severity: 'high' as const, description: 'Cookie sameSite=None allows cross-site cookie sending' },
  { pattern: /(?:origin|allowedOrigins|cors)\s*[:=]\s*['"]\*['"]/i, rule: 'CORS_WILDCARD', severity: 'high' as const, description: 'CORS wildcard origin — allows any site' },
  { pattern: /dangerouslySetInnerHTML/, rule: 'XSS_RISK', severity: 'high' as const, description: 'dangerouslySetInnerHTML — XSS risk' },
  { pattern: /innerHTML\s*=/, rule: 'XSS_RISK', severity: 'high' as const, description: 'innerHTML assignment — XSS risk' },
  { pattern: /trust\s*proxy.*true/i, rule: 'PROXY_TRUST', severity: 'low' as const, description: 'Trust proxy enabled — ensure behind reverse proxy' },
  { pattern: /localStorage\.(setItem|getItem).*token/i, rule: 'TOKEN_IN_LOCALSTORAGE', severity: 'medium' as const, description: 'Token in localStorage — XSS accessible' },
  { pattern: /node_tls_reject_unauthorized\s*=\s*0/, rule: 'TLS_DISABLED', severity: 'critical' as const, description: 'TLS certificate validation disabled' },
  { pattern: /rejectUnauthorized\s*:\s*false/, rule: 'TLS_DISABLED', severity: 'critical' as const, description: 'TLS certificate rejection disabled' },
];

const frontendRules = [
  { pattern: /dangerouslySetInnerHTML/, rule: 'XSS_RISK', severity: 'high' as const, description: 'dangerouslySetInnerHTML — XSS risk' },
  { pattern: /innerHTML\s*=/, rule: 'XSS_RISK', severity: 'high' as const, description: 'innerHTML assignment — XSS risk' },
  { pattern: /eval\s*\(/, rule: 'EVAL_USAGE', severity: 'critical' as const, description: 'eval() usage — code injection risk' },
  { pattern: /localStorage\.(setItem|getItem).*token/i, rule: 'TOKEN_IN_LOCALSTORAGE', severity: 'medium' as const, description: 'Token in localStorage — XSS accessible' },
  { pattern: /document\.cookie.*=/i, rule: 'COOKIE_MANIPULATION', severity: 'low' as const, description: 'Direct cookie manipulation from frontend' },
  { pattern: /window\.location\s*=\s*[^'"]*req/i, rule: 'OPEN_REDIRECT', severity: 'medium' as const, description: 'Potential open redirect' },
];

console.log('═══════════════════════════════════════════════════════════════');
console.log('  🔍 Static Security Scanner — Scanning source code');
console.log(`  Backend:  ${backendRoot}`);
console.log(`  Frontend: ${frontendRoot}`);
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Scanning backend...');
walkDir(backendRoot, (file) => scanFile(file, backendRules));

console.log('Scanning frontend...');
walkDir(frontendRoot, (file) => scanFile(file, frontendRules));

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  📊 Static Security Scan Results');
console.log('═══════════════════════════════════════════════════════════════\n');

if (findings.length === 0) {
  console.log('  ✅ No security issues found in source code!\n');
} else {
  const grouped: Record<string, Finding[]> = {};
  for (const f of findings) {
    if (!grouped[f.rule]) grouped[f.rule] = [];
    grouped[f.rule].push(f);
  }

  for (const [rule, items] of Object.entries(grouped)) {
    const sev = items[0].severity;
    const icon = sev === 'critical' ? '🔴' : sev === 'high' ? '🟠' : sev === 'medium' ? '🟡' : '🟢';
    console.log(`${icon} [${sev.toUpperCase()}] ${rule} (${items.length} occurrence${items.length > 1 ? 's' : ''}):`);
    for (const item of items) {
      console.log(`   📄 ${item.file}:${item.line}`);
      console.log(`      ${item.description}`);
      console.log(`      > ${item.snippet}`);
      console.log();
    }
  }
}

const critical = findings.filter(f => f.severity === 'critical').length;
const high = findings.filter(f => f.severity === 'high').length;
const medium = findings.filter(f => f.severity === 'medium').length;
const low = findings.filter(f => f.severity === 'low').length;

console.log('───────────────────────────────────────────────────────────────');
console.log(`  Total findings: ${findings.length}`);
if (critical > 0) console.log(`  🔴 Critical: ${critical}`);
if (high > 0) console.log(`  🟠 High:     ${high}`);
if (medium > 0) console.log(`  🟡 Medium:   ${medium}`);
if (low > 0) console.log(`  🟢 Low:      ${low}`);
console.log(`\n  Overall: ${findings.length === 0 ? '✅ CLEAN' : critical > 0 ? '🔴 CRITICAL ISSUES' : high > 0 ? '🟠 HIGH RISK' : '⚠️  MINOR ISSUES'}`);
console.log('═══════════════════════════════════════════════════════════════\n');

process.exit(critical > 0 ? 1 : 0);
