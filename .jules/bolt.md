# Bolt's Journal - Critical Learnings

## 2026-07-23 - [Parallel Concurrency over Sequential Loops/Awaits]
**Learning:** Sequential awaits on independent asynchronous tasks (like cache writes in a `for...of` loop or auxiliary database lookup queries) introduce substantial execution delays. Parallelizing these with `Promise.all` optimizes overall response latency without losing type safety or readable structure. In security-sensitive flows (like visibility checks), using `Promise.all` without settling ensures exceptions fail-closed.
**Action:** Always identify independent asynchronous/I/O requests (database fetches, Redis operations) and group them with `Promise.all` to execute in parallel, keeping fail-closed posture when checking permissions or visibility.
