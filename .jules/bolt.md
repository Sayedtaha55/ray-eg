# Bolt's Performance Journal

## 2026-07-20 - [Scope Constraints of Schema Changes]
**Learning:** Modifying `prisma/schema.prisma` to resolve pre-existing Prisma validation errors (e.g., mapping collisions or one-to-one relation unique constraint issues) is required to successfully run `prisma generate`, `npm install`, and tests locally, but actual changes to `prisma/schema.prisma` are strictly out-of-scope for Bolt performance PRs and must be fully reverted prior to submission.
**Action:** Always use `git restore` on `prisma/schema.prisma` to discard those helper changes before final submission while keeping the performance improvements intact.
