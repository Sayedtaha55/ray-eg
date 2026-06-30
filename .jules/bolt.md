## 2026-06-01 - Zero-DB Cache Hit Pattern in ProductService
**Learning:** Implementing a "Zero-DB Cache Hit" pattern by filtering data *before* caching in `listByShop` and `listAllActive` significantly reduces latency on cache hits by eliminating redundant database lookups for visibility metadata. Parallelizing core Prisma queries with secondary metadata fetches (linked IDs, active labels) further optimizes the cache-miss path.
**Action:** Always consider if visibility filtering can be moved upstream of the cache layer to ensure cache hits are truly "Zero-DB".

## 2026-06-01 - Strict Constraint on package-lock.json
**Learning:** Running `npm install` in this environment (required for generating Prisma client and running tests) can inadvertently modify `package-lock.json` even without intentional dependency changes, violating strict agent constraints.
**Action:** Always verify `git status` and revert unintentional `package-lock.json` changes before submission.
