# AGENTS.md

## Purpose

This file defines the general working rules for coding agents contributing to this repository.

Project-specific technical context belongs in `codex-context.md`.

Product requirements belong in `PRD.md`.

Frontend design and UI implementation rules belong in `style-guide.md`.

---

## Working Rules

- Inspect relevant existing code before making changes.
- Follow established repository conventions.
- Keep changes focused on the requested task.
- Avoid unrelated refactors.
- Prefer simple implementations over speculative abstractions.
- Do not introduce competing patterns for an existing concern.
- Reuse existing utilities, types, helpers, and conventions when appropriate.
- Keep responsibilities clear and modules cohesive.
- Avoid duplicated business logic and duplicated configuration.
- Preserve strong TypeScript typing.
- Avoid unnecessary `any`, type suppression, or unsafe casts.
- Validate untrusted runtime input using the project's established approach.
- Preserve existing authentication and authorization boundaries.
- Do not bypass access control to make a feature work.
- Preserve important data integrity rules.
- Use migrations for database schema changes.
- Avoid destructive database changes unless explicitly required.
- Do not manually edit generated files unless the repository expects it.
- Do not add dependencies unless they provide clear value.
- Never commit secrets, credentials, tokens, or private keys.
- Avoid logging sensitive authentication or user data.
- Preserve existing public behavior unless the task intentionally changes it.
- Add or update tests for important behavior when practical.
- Add regression tests when fixing meaningful bugs.
- Update documentation only when the implementation materially changes documented behavior.
- Read `codex-context.md` when project-specific technical context is needed.
- Read `PRD.md` only when product scope or behavior needs clarification.
- Read `style-guide.md` for frontend and UI work.
- Do not duplicate information across documentation unnecessarily.

---

## Implementation Discipline

Before implementing:

1. Inspect the affected files and nearby patterns.
2. Identify the smallest correct change.
3. Check whether a reusable implementation already exists.

Before completing:

1. Review the diff for unrelated changes.
2. Run the relevant repository checks.
3. Fix failures caused by the change.
4. Confirm the requested behavior is implemented.

---

## Bun Commands

Use Bun as the package manager and runtime unless the repository explicitly requires otherwise.

### Install dependencies

```bash id="4k6j5p"
bun install
```

### Start development

From the repository root:

```bash id="ji0jpi"
bun dev
```

### Build

```bash id="xgts0a"
bun run build
```

### Type checking

Use the existing package script if available:

```bash id="y4qpbp"
bun run check-types
```

If the repository uses a different typecheck script, inspect `package.json` and use that script instead.

### Lint

```bash id="zr00yu"
bun run lint
```

### Tests

```bash id="zi2j6b"
bun test
```

If tests are exposed through a workspace script instead:

```bash id="cwwo2w"
bun run test
```

### Run a package script

```bash id="h3wrca"
bun run <script>
```

### Add a dependency

```bash id="quscmn"
bun add <package>
```

### Add a development dependency

```bash id="yigdmw"
bun add -d <package>
```

### Remove a dependency

```bash id="v6le8i"
bun remove <package>
```

### Prisma generate

```bash id="ae469v"
bunx prisma generate
```

### Prisma migration

```bash id="3utmuf"
bunx prisma migrate dev
```

### Prisma Studio

```bash id="tml25j"
bunx prisma studio
```

### Prisma validation

```bash id="yt7h0t"
bunx prisma validate
```

### Run workspace commands

When a command only applies to one app or package, use the repository's existing Turborepo or workspace scripts rather than manually changing tooling.

Inspect root and workspace `package.json` files before guessing command names.

---

## Command Rules

- Prefer scripts already defined in `package.json`.
- Do not substitute npm, pnpm, or yarn commands when a Bun equivalent exists.
- Do not invent script names.
- Inspect `package.json` before running an unfamiliar command.
- Do not run destructive database or reset commands unless explicitly required.
- Do not force-push, rewrite Git history, or delete branches unless explicitly requested.

---

## Core Principle

Make the smallest correct change that fits the existing codebase, then verify it using the repository's established Bun scripts.
