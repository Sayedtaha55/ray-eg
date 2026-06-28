## 2026-06-15 - Centralize isLowEndDevice detection
**Learning:** Redundant hardware capability detection (regex matching User Agent and accessing `navigator.hardwareConcurrency`/`deviceMemory`) was being performed in hot paths like `ProductCard` across the app. In large lists, this resulted in hundreds of unnecessary calculations.
**Action:** Centralize detection in a utility with module-level caching. Ensure the utility covers both mobile and low-end desktop hardware to maintain performance optimizations across all platforms.
