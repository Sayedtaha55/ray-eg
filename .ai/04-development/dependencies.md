# Dependency Policy

Before adding any package ask:

Is it maintained?

Is it popular?

Is it secure?

Is it actively updated?

Does it support TypeScript?

Does it increase bundle size?

Do we already have another package doing this?

-------------------------------------

Forbidden

Packages without maintenance.

Packages with critical CVEs.

Packages abandoned.

Packages with incompatible licenses.

-------------------------------------

Always

Review changelog.

Review GitHub issues.

Review bundle impact.

Review security advisories.

-------------------------------------

Updates

Check monthly.

Update minor versions regularly.

Major versions require testing.

-------------------------------------

Never install a package only for one small utility.

Prefer native JavaScript whenever possible.