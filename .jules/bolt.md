## 2026-04-23 - [ShopPublicQueryService Latency Reduction]
**Learning:** Sequential await calls for independent database queries in high-traffic services (like shop profile queries) add unnecessary latency that scales with database response times.
**Action:** Use Promise.all to fetch linked image map data (hotspots and label keys) concurrently in both cache-hit and database-fallback paths.
