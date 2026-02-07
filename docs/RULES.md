# Project Rules

## Documentation
- All commits must be written in **English**
- All external-facing documents (README, SKILL.md, etc.) must be written in **English**
- Tasks document must be created first and kept updated (PM responsibility)
- Always reference and update related documents

## Git Configuration
- Each contributor must configure git with their own name and email (`@1xp.com` domain)
- Verify collaborator access before starting work

## Development Process
- **TDD (Test-Driven Development)**: Write tests first
- Use `.husky` for git hooks:
  - `pre-commit`: lint
  - `pre-push`: test

## Tech Stack
- TypeScript
- ESLint
- Svelte

## Tools
- MCP: context7
- Reference existing skills and documentation

## Code Quality
- All code must pass linting before commit
- All tests must pass before push
