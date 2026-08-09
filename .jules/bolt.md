## 2026-06-05 - [Zero-DB Cache Hit & Parallelization Pattern]
**Learning:** Product listing methods were performing redundant DB lookups on cache hits for filtering visibility (image map hotspots). Moving this filtering logic upstream to execute *before* caching allows for a "Zero-DB Cache Hit" pattern. Additionally, parallelizing the primary product query with its associated metadata lookups (linked IDs, label keys) reduces latency on cache misses.
**Action:** Always filter product visibility constraints before committing to Redis; use `Promise.all` to fetch independent metadata concurrently during cache misses.

## 2026-06-05 - [Sandbox Dependency Safety]
**Learning:** Running `npm install` in some environments can modify `package-lock.json` in ways that shouldn't be committed (e.g. moving devDeps to deps). This leads to inconsistent repository states and PR rejection.
**Action:** Always verify `package-lock.json` diff before submission and revert any unintended changes introduced by environment setup commands.
