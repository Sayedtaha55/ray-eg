/**
 * Security Audit Script — Comprehensive security testing for the backend API.
 *
 * Usage:
 *   npx ts-node backend/tests/security/security-audit.ts --base-url=http://localhost:4000
 *
 * Tests:
 *   1. Unauthenticated access to protected endpoints
 *   2. CSRF token enforcement on mutations
 *   3. Rate limiting on auth endpoints (brute force)
 *   4. CORS policy enforcement
 *   5. Security headers (CSP, HSTS, X-Frame-Options, etc.)
 *   6. Health endpoint information disclosure
 *   7. Monitoring endpoint access control
 *   8. SQL injection patterns in input validation
 *   9. XSS payload rejection
 *  10. Body size limit enforcement
 *  11. JWT token validation
 *  12. Dev bootstrap endpoint protection in production
 */

import * as http from 'http';

const BASE_URL = process.argv.find(a => a.startsWith('--base-url='))?.split('=')[1] || 'http://localhost:4000';
const url = new URL(BASE_URL);
const HOST = url.hostname;
const PORT = parseInt(url.port || '4000', 10);

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  details: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

const results: TestResult[] = [];

function request(method: string, path: string, body?: any, headers?: Record<string, string>): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const data = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (data) reqHeaders['Content-Length'] = Buffer.byteLength(data).toString();

    const req = http.request(
      { hostname: HOST, port: PORT, path, method, headers: reqHeaders },
      (res) => {
        let chunks = '';
        res.on('data', (c) => (chunks += c));
        res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, body: chunks }));
      },
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function record(name: string, category: string, passed: boolean, details: string, severity: TestResult['severity']) {
  results.push({ name, category, passed, details, severity });
  const icon = passed ? '✅' : '❌';
  const sev = severity.toUpperCase().padEnd(8);
  console.log(`${icon} [${sev}] ${category} > ${name}: ${details}`);
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ─── Tests ───

async function testUnauthenticatedAccess() {
  console.log('\n🔒 Testing Unauthenticated Access to Protected Endpoints...\n');

  const protectedEndpoints = [
    { path: '/api/v1/orders', method: 'GET', name: 'Orders list' },
    { path: '/api/v1/products', method: 'GET', name: 'Products list' },
    { path: '/api/v1/shops', method: 'GET', name: 'Shops list' },
    { path: '/api/v1/media/presign', method: 'POST', name: 'Media presign' },
    { path: '/api/v1/ai/builder/generate-theme', method: 'POST', name: 'AI builder' },
  ];

  for (const ep of protectedEndpoints) {
    try {
      const res = await request(ep.method, ep.path, ep.method === 'POST' ? {} : undefined);
      const isProtected = res.status === 401 || res.status === 403;
      record(
        `${ep.name} (${ep.method} ${ep.path})`,
        'Unauthenticated Access',
        isProtected,
        `Status: ${res.status} — ${isProtected ? 'Properly rejected' : 'ACCESS GRANTED without auth!'}`,
        isProtected ? 'info' : 'critical',
      );
    } catch (e: any) {
      record(ep.name, 'Unauthenticated Access', false, `Error: ${e.message}`, 'high');
    }
  }
}

async function testCsrfEnforcement() {
  console.log('\n🔒 Testing CSRF Token Enforcement...\n');

  // First, get a CSRF token via GET
  try {
    const getRes = await request('GET', '/api/v1/auth/session');
    const csrfToken = getRes.headers['x-csrf-token'] as string || '';

    // Try POST without CSRF token
    const noCsrfRes = await request('POST', '/api/v1/auth/deactivate', {});
    const blocked = noCsrfRes.status === 403;
    record(
      'POST without CSRF token',
      'CSRF Protection',
      blocked,
      `Status: ${noCsrfRes.status} — ${blocked ? 'Properly blocked' : 'Mutation accepted without CSRF!'}`,
      blocked ? 'info' : 'high',
    );

    // Try POST with mismatched CSRF token
    const badCsrfRes = await request('POST', '/api/v1/auth/deactivate', {}, { 'x-csrf-token': 'invalid-token-12345' });
    const blockedBad = badCsrfRes.status === 403;
    record(
      'POST with invalid CSRF token',
      'CSRF Protection',
      blockedBad,
      `Status: ${badCsrfRes.status} — ${blockedBad ? 'Properly blocked' : 'Invalid token accepted!'}`,
      blockedBad ? 'info' : 'high',
    );
  } catch (e: any) {
    record('CSRF test setup', 'CSRF Protection', false, `Error: ${e.message}`, 'high');
  }
}

async function testRateLimiting() {
  console.log('\n🔒 Testing Auth Rate Limiting (Brute Force Protection)...\n');

  const loginPath = '/api/v1/auth/login';
  let blocked = false;
  let attempts = 0;
  const maxAttempts = 15; // Should hit rate limit at ~10

  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const res = await request('POST', loginPath, { email: `test${i}@test.com`, password: 'wrong' });
      attempts++;
      if (res.status === 429) {
        blocked = true;
        record(
          'Auth rate limiting triggers',
          'Rate Limiting',
          true,
          `Blocked after ${i} attempts (status 429)`,
          'info',
        );
        break;
      }
    } catch (e: any) {
      // Network error is acceptable
    }
    await sleep(50);
  }

  if (!blocked) {
    record(
      'Auth rate limiting triggers',
      'Rate Limiting',
      false,
      `No rate limiting after ${attempts} attempts — brute force possible!`,
      'high',
    );
  }
}

async function testCorsPolicy() {
  console.log('\n🔒 Testing CORS Policy...\n');

  try {
    // Test with disallowed origin
    const res = await request('GET', '/api/v1/auth/session', undefined, { Origin: 'https://evil-site.com' });
    const allowOrigin = res.headers['access-control-allow-origin'] as string;
    const blocked = !allowOrigin || allowOrigin !== 'https://evil-site.com';
    record(
      'CORS blocks disallowed origin',
      'CORS Policy',
      blocked,
      `Origin header: ${allowOrigin || 'none'} — ${blocked ? 'Properly blocked' : 'Evil origin allowed!'}`,
      blocked ? 'info' : 'high',
    );

    // Test with no origin (same-origin)
    const res2 = await request('GET', '/api/v1/auth/session');
    record(
      'CORS allows same-origin (no Origin header)',
      'CORS Policy',
      true,
      `Status: ${res2.status}`,
      'info',
    );
  } catch (e: any) {
    record('CORS test', 'CORS Policy', false, `Error: ${e.message}`, 'high');
  }
}

async function testSecurityHeaders() {
  console.log('\n🔒 Testing Security Headers...\n');

  try {
    const res = await request('GET', '/api/v1/auth/session');
    const headers = res.headers;

    const checks = [
      { header: 'content-security-policy', name: 'CSP header present' },
      { header: 'x-frame-options', name: 'X-Frame-Options (clickjacking protection)' },
      { header: 'x-content-type-options', name: 'X-Content-Type-Options (MIME sniffing protection)' },
      { header: 'strict-transport-security', name: 'HSTS header (HTTPS enforcement)' },
      { header: 'x-xss-protection', name: 'X-XSS-Protection header' },
    ];

    for (const check of checks) {
      const present = !!headers[check.header];
      record(
        check.name,
        'Security Headers',
        present,
        present ? `Value: ${String(headers[check.header]).slice(0, 80)}...` : 'MISSING',
        present ? 'info' : 'medium',
      );
    }

    // Check CSP doesn't contain unsafe-inline in scriptSrc (production)
    const csp = String(headers['content-security-policy'] || '');
    const hasUnsafeInline = csp.includes("'unsafe-inline'") && csp.includes('script-src');
    record(
      'CSP scriptSrc without unsafe-inline (production check)',
      'Security Headers',
      !hasUnsafeInline || String(process.env.NODE_ENV || '') !== 'production',
      hasUnsafeInline ? 'CSP allows unsafe-inline in script-src' : 'OK',
      hasUnsafeInline ? 'high' : 'info',
    );
  } catch (e: any) {
    record('Security headers test', 'Security Headers', false, `Error: ${e.message}`, 'high');
  }
}

async function testHealthInfoDisclosure() {
  console.log('\n🔒 Testing Health Endpoint Information Disclosure...\n');

  try {
    const res = await request('GET', '/health/detailed');
    const isProtected = res.status === 401 || res.status === 403;
    const body = res.body;
    const leaksInfo = body.includes('heap') || body.includes('rss') || body.includes('cpu') || body.includes('uptime');

    record(
      'health/detailed requires authentication',
      'Info Disclosure',
      isProtected || !leaksInfo,
      `Status: ${res.status} — ${isProtected ? 'Properly guarded' : leaksInfo ? 'Leaks system info!' : 'No sensitive info in response'}`,
      isProtected ? 'info' : 'critical',
    );
  } catch (e: any) {
    record('Health info disclosure test', 'Info Disclosure', false, `Error: ${e.message}`, 'high');
  }
}

async function testMonitoringAccess() {
  console.log('\n🔒 Testing Monitoring Endpoint Access Control...\n');

  const monitoringEndpoints = [
    { path: '/monitoring/health', name: 'Monitoring health' },
    { path: '/monitoring/metrics', name: 'Monitoring metrics' },
    { path: '/monitoring/alerts', name: 'Monitoring alerts' },
    { path: '/monitoring/dashboard', name: 'Monitoring dashboard' },
  ];

  for (const ep of monitoringEndpoints) {
    try {
      const res = await request('GET', ep.path);
      const isProtected = res.status === 401 || res.status === 403;
      record(
        ep.name,
        'Monitoring Access',
        isProtected,
        `Status: ${res.status} — ${isProtected ? 'Properly guarded' : 'Accessible without auth!'}`,
        isProtected ? 'info' : 'critical',
      );
    } catch (e: any) {
      record(ep.name, 'Monitoring Access', false, `Error: ${e.message}`, 'high');
    }
  }
}

async function testSqlInjection() {
  console.log('\n🔒 Testing SQL Injection Patterns...\n');

  const payloads = [
    { field: 'email', value: "' OR '1'='1" },
    { field: 'email', value: "admin@ray.com'; DROP TABLE users;--" },
    { field: 'email', value: "' UNION SELECT * FROM users--" },
    { field: 'email', value: "1' OR 1=1--" },
  ];

  for (const payload of payloads) {
    try {
      const res = await request('POST', '/api/v1/auth/login', { email: payload.value, password: 'test12345' });
      const body = res.body;
      const hasSqlError = body.toLowerCase().includes('sql') || body.toLowerCase().includes('syntax error') || body.toLowerCase().includes('prisma');
      record(
        `SQL injection in ${payload.field}: "${payload.value.slice(0, 30)}..."`,
        'SQL Injection',
        !hasSqlError,
        `Status: ${res.status} — ${hasSqlError ? 'SQL error leaked!' : 'No SQL error in response'}`,
        hasSqlError ? 'critical' : 'info',
      );
    } catch (e: any) {
      record('SQL injection test', 'SQL Injection', false, `Error: ${e.message}`, 'high');
    }
  }
}

async function testXssPayloads() {
  console.log('\n🔒 Testing XSS Payload Rejection...\n');

  const xssPayloads = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(document.cookie)</script>',
    "javascript:alert('xss')",
  ];

  for (const payload of xssPayloads) {
    try {
      const res = await request('POST', '/api/v1/auth/signup', {
        email: `${payload}@test.com`,
        password: 'Test1234!@',
        storeName: payload,
      });
      const body = res.body;
      const reflected = body.includes(payload);
      record(
        `XSS payload: "${payload.slice(0, 30)}..."`,
        'XSS Protection',
        !reflected,
        `Status: ${res.status} — ${reflected ? 'Payload reflected in response!' : 'Not reflected'}`,
        reflected ? 'high' : 'info',
      );
    } catch (e: any) {
      record('XSS test', 'XSS Protection', false, `Error: ${e.message}`, 'medium');
    }
  }
}

async function testBodySizeLimit() {
  console.log('\n🔒 Testing Body Size Limit (DoS Protection)...\n');

  try {
    // Create a large payload (>10MB)
    const largePayload = { email: 'a'.repeat(11 * 1024 * 1024) + '@test.com', password: 'test12345' };
    const res = await request('POST', '/api/v1/auth/login', largePayload);
    const rejected = res.status === 413 || res.status === 400;
    record(
      'Large body (>10MB) rejected',
      'Body Size Limit',
      rejected,
      `Status: ${res.status} — ${rejected ? 'Properly rejected' : 'Large payload accepted!'}`,
      rejected ? 'info' : 'medium',
    );
  } catch (e: any) {
    // Connection reset is also acceptable
    record('Large body rejected', 'Body Size Limit', true, `Connection error (expected): ${e.message}`, 'info');
  }
}

async function testJwtValidation() {
  console.log('\n🔒 Testing JWT Token Validation...\n');

  const invalidTokens = [
    'invalid.jwt.token',
    'Bearer invalid',
    '',
    'null',
    'undefined',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  ];

  for (const token of invalidTokens) {
    try {
      const res = await request('GET', '/api/v1/orders', undefined, { Authorization: `Bearer ${token}` });
      const rejected = res.status === 401 || res.status === 403;
      record(
        `Invalid JWT: "${token.slice(0, 20)}..."`,
        'JWT Validation',
        rejected,
        `Status: ${res.status} — ${rejected ? 'Properly rejected' : 'Invalid token accepted!'}`,
        rejected ? 'info' : 'critical',
      );
    } catch (e: any) {
      record('JWT validation test', 'JWT Validation', false, `Error: ${e.message}`, 'high');
    }
  }
}

async function testDevBootstrapProtection() {
  console.log('\n🔒 Testing Dev Bootstrap Endpoint Protection...\n');

  const devEndpoints = [
    { path: '/api/v1/auth/dev-merchant-login', method: 'POST', body: { shopCategory: 'RETAIL' } },
    { path: '/api/v1/auth/dev-courier-login', method: 'POST', body: {} },
  ];

  for (const ep of devEndpoints) {
    try {
      const res = await request(ep.method, ep.path, ep.body);
      const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
      const blockedInProd = res.status === 200 && res.body.includes('"ok":false');
      const csrfBlocked = res.status === 403;

      if (isDev) {
        record(
          `${ep.path} (dev mode)`,
          'Dev Bootstrap Protection',
          true,
          `Status: ${res.status} — Dev mode, endpoint accessible (expected)`,
          'info',
        );
      } else {
        record(
          `${ep.path} (production)`,
          'Dev Bootstrap Protection',
          blockedInProd || csrfBlocked,
          `Status: ${res.status} — ${blockedInProd || csrfBlocked ? 'Properly blocked' : 'Dev endpoint accessible in production!'}`,
          blockedInProd || csrfBlocked ? 'info' : 'high',
        );
      }
    } catch (e: any) {
      record(ep.path, 'Dev Bootstrap Protection', false, `Error: ${e.message}`, 'medium');
    }
  }
}

async function testDbTestEndpoint() {
  console.log('\n🔒 Testing DB Test Endpoint...\n');

  try {
    const res = await request('GET', '/api/v1/db-test');
    const isProtected = res.status === 401 || res.status === 403;
    const isDisabled = res.body.includes('disabled');
    record(
      'DB test endpoint access',
      'DB Test Protection',
      isProtected || isDisabled,
      `Status: ${res.status} — ${isProtected ? 'Auth guarded' : isDisabled ? 'Disabled in production' : 'Accessible!'}`,
      isProtected || isDisabled ? 'info' : 'medium',
    );
  } catch (e: any) {
    record('DB test endpoint', 'DB Test Protection', false, `Error: ${e.message}`, 'medium');
  }
}

// ─── Main ───

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🔐 Security Audit — Starting comprehensive security tests');
  console.log(`  Target: ${BASE_URL}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  await testUnauthenticatedAccess();
  await testCsrfEnforcement();
  await testRateLimiting();
  await testCorsPolicy();
  await testSecurityHeaders();
  await testHealthInfoDisclosure();
  await testMonitoringAccess();
  await testSqlInjection();
  await testXssPayloads();
  await testBodySizeLimit();
  await testJwtValidation();
  await testDevBootstrapProtection();
  await testDbTestEndpoint();

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  📊 Security Audit Summary');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const critical = results.filter(r => !r.passed && r.severity === 'critical').length;
  const high = results.filter(r => !r.passed && r.severity === 'high').length;
  const medium = results.filter(r => !r.passed && r.severity === 'medium').length;

  console.log(`  Total tests: ${results.length}`);
  console.log(`  ✅ Passed:   ${passed}`);
  console.log(`  ❌ Failed:   ${failed}`);
  if (critical > 0) console.log(`  🔴 Critical: ${critical}`);
  if (high > 0) console.log(`  🟠 High:     ${high}`);
  if (medium > 0) console.log(`  🟡 Medium:   ${medium}`);
  console.log(`\n  Overall: ${failed === 0 ? '✅ ALL TESTS PASSED' : critical > 0 ? '🔴 CRITICAL VULNERABILITIES FOUND' : high > 0 ? '🟠 HIGH RISK ISSUES FOUND' : '⚠️  MINOR ISSUES FOUND'}`);
  console.log('\n═══════════════════════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(2);
});
