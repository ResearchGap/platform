# ResearchGap — Codex Context

## Project

ResearchGap is a research-focused learning and program management platform.

The current MVP centers around:

- bootcamps,
- bootcamp sessions,
- enrollment keys,
- webinars,
- research content,
- account approval,
- staff administration.

ResearchGap currently behaves primarily as a lightweight research-oriented LMS.

---

## Users

### Mentee

- register and authenticate,
- manage profile,
- browse bootcamps,
- enroll using enrollment keys,
- access enrolled bootcamp resources,
- browse webinar information,
- browse research content.

### Mentor

- registration requires approval,
- manage professional profile,
- contribute to bootcamps and sessions,
- view relevant participants,
- create webinar information,
- create research content.

### CEO

- executive monitoring,
- analytics and platform overview.

### COO

- bootcamp operations,
- webinar operations,
- enrollment management.

### CMO

- content,
- visual assets,
- marketing presentation.

### CTO / Superadmin

- mentor and staff approval,
- account administration,
- role/access administration,
- system administration.

---

## Current Product Constraints

ResearchGap is currently not:

- a mentor marketplace,
- a direct messaging platform,
- a native webinar platform,
- a payment platform,
- a co-author marketplace,
- an AI recommendation platform.

Webinars are informational records and may link to external platforms.

Mentor and staff accounts require approval.

---

## Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query

### Backend

- Express.js
- TypeScript
- Bun
- REST over HTTP/JSON

### Authentication

- Better Auth

### Persistence

- PostgreSQL
- Prisma ORM

### Monorepo

- Turborepo
- Bun workspaces

Initial development infrastructure may use Vercel and Supabase.

---

## Project Bootstrap

The project was initialized with Better-T-Stack using approximately:

```bash
bun create better-t-stack@latest platform \
  --frontend next \
  --backend express \
  --runtime bun \
  --api none \
  --auth better-auth \
  --payments none \
  --database postgres \
  --orm prisma \
  --db-setup supabase \
  --package-manager bun \
  --git \
  --web-deploy none \
  --server-deploy none \
  --install \
  --addons skills turborepo \
  --examples none
```

Repository:

```text
researchgap/platform
```

---

## Architecture

The system uses a modular-monolith architecture with infrastructure and transport boundaries.

Detailed architecture rules are defined in:

> `architecture.md`

Consult it for:

- backend layering,
- dependency direction,
- repository boundaries,
- infrastructure portability,
- authentication/authorization separation,
- permissions and access profiles,
- storage abstraction,
- deployment architecture,
- future gRPC/service extraction.

Do not duplicate these rules here.

---

## Authorization Summary

Business access is permission-based.

Conceptually:

```text
User
 ↓
Role
 ↓
Access Profile
 ↓
Permissions
```

Organizational roles and system capabilities must remain separate.

Detailed rules belong in `architecture.md`.

---

## Core Data Areas

Important application entities currently include:

- `UserProfile`
- `UserAccess`
- `AccountApproval`
- `UserPermissionOverride`
- `MediaAsset`
- `Bootcamp`
- `BootcampSession`
- `EnrollmentKey`
- `BootcampEnrollment`
- `Webinar`
- `ResearchContent`
- `Category`
- `SiteSetting`
- `AuditLog`

Better Auth owns its authentication-related entities.

Detailed fields and product requirements belong in `PRD.md`.

---

## Important Data Rules

- A mentee cannot enroll in the same bootcamp more than once.
- Enrollment keys have an independent lifecycle.
- Mentor and staff accounts require approval.
- `BootcampSession` is distinct from authentication `Session`.
- Provider-specific infrastructure details should not become domain assumptions.

---

## Current Development Direction

Recommended implementation order:

1. foundation and repository cleanup,
2. authentication,
3. authorization,
4. account approval,
5. user profile/access models,
6. content and webinars,
7. bootcamps and sessions,
8. enrollment,
9. staff dashboards,
10. hardening,
11. deployment.

The exact roadmap is defined in `PRD.md`.

---

## Documentation Map

Use the smallest relevant source:

- `AGENTS.md` — general rules for coding agents.
- `codex-context.md` — concise current project context.
- `architecture.md` — technical architecture and boundaries.
- `PRD.md` — detailed product requirements, data schema, and roadmap.
- `style-guide.md` — frontend visual and styling rules.

For routine coding tasks, do not load the entire PRD unless product behavior or scope needs clarification.

---

## Current Principle

Build the MVP as a clean modular monolith.

Avoid speculative complexity while preserving boundaries that make future infrastructure changes and service extraction practical.
