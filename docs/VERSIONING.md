# Versioning Policy

## Semantic Versioning (SemVer)

This project follows [Semantic Versioning 2.0.0](https://semver.org/).

**Format:** `MAJOR.MINOR.PATCH`

| Type | When to bump | Example |
|------|--------------|---------|
| **MAJOR** | Breaking API changes | 1.0.0 → 2.0.0 |
| **MINOR** | New features (backward compatible) | 1.0.0 → 1.1.0 |
| **PATCH** | Bug fixes (backward compatible) | 1.0.0 → 1.0.1 |

---

## Branch Strategy

```
main (development)
  │
  └── PR merge ──► release (production)
                      │
                      └── Auto npm publish
```

- **main**: Active development, all PRs target here
- **release**: Production-ready code, triggers npm publish on merge

---

## Release Workflow

### 1. Development (main branch)
- All feature/bugfix PRs merge into `main`
- Tests run automatically on every push

### 2. Prepare Release
Before merging to `release`, bump version in `package.json`:

```bash
# Patch release (bug fixes)
npm version patch

# Minor release (new features)
npm version minor

# Major release (breaking changes)
npm version major
```

### 3. Deploy (release branch)
1. Create PR: `main` → `release`
2. Review & approve
3. Merge triggers automatic npm publish

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-03 | Initial release |

---

## Guidelines

1. **Never publish directly** - Always go through release branch
2. **Test before release** - Ensure all tests pass on main
3. **Document changes** - Update CHANGELOG for each release
4. **Tag releases** - Use git tags for major releases (`v1.0.0`)
