## 2026-07-18 - Schema changes out of scope for performance optimization
**Learning:** Modifying `prisma/schema.prisma` to fix pre-existing schema validation/parsing issues can block PR integration or cause validation risks in other environments if migration scripts are not run. It is essential to restore any changes made to `prisma/schema.prisma` before submitting, even if they were temporarily necessary to generate the client locally.
**Action:** Always avoid or revert schema changes before submitting a performance optimization pull request.
