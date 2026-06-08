## 2026-06-01 - Home Feed Optimization & Rules of Hooks
**Learning:** Even when performance-focused, React's Rules of Hooks are absolute. Moving `useCallback` into JSX props violates these rules and can crash the app. Prop stability for `React.memo` components is best achieved with top-level `useCallback` declarations.
**Action:** Always declare hooks at the top level of the component and verify with `typecheck` before considering a step complete.
