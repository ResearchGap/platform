# ResearchGap — Architecture

## 1. Purpose

This document defines the technical architecture of ResearchGap.

It describes:

- system boundaries,
- dependency direction,
- backend layering,
- module organization,
- authentication and authorization boundaries,
- persistence and storage abstraction,
- deployment portability,
- and future service extraction strategy.

Product behavior belongs in `PRD.md`.

Current implementation context belongs in `codex-context.md`.

Frontend visual rules belong in `style-guide.md`.

---

# 2. Architecture Goals

ResearchGap should be:

- simple enough to develop as a modular monolith,
- maintainable as the codebase grows,
- independent from a specific hosting provider,
- independent from a specific PostgreSQL provider,
- independent from a specific storage provider,
- transport-agnostic at the application layer,
- easy to test,
- capable of gradual service extraction when justified.

The architecture should support future growth without introducing distributed-system complexity prematurely.

---

# 3. Architecture Style

ResearchGap starts as a:

> **Modular Monolith**

Frontend and backend remain separate applications inside one monorepo.

The backend is divided into cohesive business modules, but all modules initially run inside the same server process.

```text
ResearchGap Platform
│
├── Web Application
│   └── Next.js
│
└── Backend Application
    └── Express
        ├── Users
        ├── Approvals
        ├── Bootcamps
        ├── Enrollments
        ├── Webinars
        ├── Content
        └── Dashboard
```

Modules should communicate through explicit application interfaces rather than tightly coupling their internal implementation.

---

# 4. High-Level System

```text
Browser
   │
   │ HTTP / JSON
   ▼
Next.js
   │
   │ REST
   ▼
Express Transport Layer
   │
   ▼
Application Services
   │
   ▼
Ports / Repository Interfaces
   │
   ▼
Infrastructure Adapters
   │
   ├── PostgreSQL
   ├── File Storage
   ├── Authentication
   └── External Services
```

The current client-facing protocol is REST over HTTP/JSON.

REST is a transport choice, not a business-layer dependency.

---

# 5. Dependency Direction

The primary dependency direction is:

```text
Transport
    ↓
Application
    ↓
Ports
    ↓
Infrastructure
```

Dependencies should point inward toward application behavior.

Infrastructure implementations should not dictate business logic.

---

# 6. Layer Responsibilities

## 6.1 Transport Layer

Responsible for protocol-specific concerns.

Examples:

- HTTP routes,
- controllers,
- request parsing,
- runtime request validation,
- authentication context extraction,
- authorization middleware integration,
- response serialization,
- HTTP status mapping.

Transport code should remain thin.

It should not contain significant business rules.

---

## 6.2 Application Layer

Responsible for use cases and business operations.

Examples:

- publishing a bootcamp,
- enrolling a mentee,
- approving a mentor,
- publishing a webinar,
- changing an account access profile.

Application services should receive explicit input values rather than HTTP-specific objects.

Application services must not depend directly on:

- Express,
- Vercel,
- Supabase SDK,
- concrete storage providers,
- gRPC,
- HTTP request or response objects.

---

## 6.3 Port Layer

Ports define contracts required by application services.

Examples:

- repositories,
- file storage,
- external notification service,
- clock/time abstraction where justified.

Example conceptual dependency:

```text
BootcampService
      ↓
BootcampRepository
```

The service depends on the repository contract, not its database implementation.

---

## 6.4 Infrastructure Layer

Infrastructure contains concrete implementations of application ports.

Examples:

```text
BootcampRepository
      ↓
PrismaBootcampRepository

FileStorage
      ↓
SupabaseStorageAdapter
```

Infrastructure may depend on external libraries and providers.

Application services should not depend on those concrete implementations.

---

# 7. Backend Module Structure

Expected business modules include:

```text
modules/
├── users/
├── approvals/
├── bootcamps/
├── enrollments/
├── webinars/
├── content/
└── dashboard/
```

A module may contain:

```text
bootcamps/
├── bootcamp.service.ts
├── bootcamp.repository.ts
├── bootcamp.schema.ts
├── bootcamp.types.ts
└── bootcamp.errors.ts
```

Files should only be introduced when the module requires them.

Avoid creating empty architecture purely for symmetry.

---

# 8. Proposed Backend Structure

```text
apps/server/src/
│
├── modules/
│   ├── users/
│   ├── approvals/
│   ├── bootcamps/
│   ├── enrollments/
│   ├── webinars/
│   ├── content/
│   └── dashboard/
│
├── authorization/
│   ├── permissions.ts
│   ├── access-profiles.ts
│   ├── roles.ts
│   ├── authorize.ts
│   └── authorization.types.ts
│
├── transport/
│   └── http/
│       ├── routes/
│       ├── controllers/
│       └── middleware/
│
├── infrastructure/
│   ├── auth/
│   ├── database/
│   └── storage/
│
├── config/
└── index.ts
```

This structure is a direction, not a requirement to create every directory immediately.

The generated Better-T-Stack structure should be evolved incrementally.

---

# 9. Frontend Boundary

The frontend is a separate application under the monorepo.

```text
apps/web
```

It communicates with backend capabilities through API contracts.

The frontend should not directly access application database tables.

Frontend code may communicate directly with authentication client APIs where required by Better Auth, but business operations should remain behind backend application boundaries.

Frontend visual conventions are defined separately in `style-guide.md`.

---

# 10. API Architecture

ResearchGap uses:

> REST over HTTP/JSON

Typical flow:

```text
HTTP Request
     ↓
Validation
     ↓
Authentication
     ↓
Authorization
     ↓
Application Service
     ↓
Repository / External Port
     ↓
HTTP Response
```

API controllers should primarily translate between HTTP and application-level inputs/outputs.

---

# 11. API Contracts

Public API contracts should not be treated as identical to persistence models.

Avoid exposing Prisma models directly as the API contract by default.

This allows:

- database structures to evolve,
- internal fields to remain private,
- responses to be shaped for client needs,
- infrastructure changes without automatically changing the API.

Shared contracts may live in:

```text
packages/contracts
```

when both frontend and backend need the same stable definitions.

---

# 12. Authentication Architecture

Authentication is handled by:

> **Better Auth**

Better Auth is responsible for:

- identity,
- credentials,
- sessions,
- authentication accounts,
- verification,
- authentication lifecycle.

ResearchGap should not implement a parallel authentication system.

---

# 13. Authentication Boundary

Authentication answers:

> Who is the current user?

Application authorization answers:

> What is this user allowed to do?

These concerns remain separate.

```text
Better Auth
    │
    ▼
Authenticated User
    │
    ▼
ResearchGap UserAccess
    │
    ▼
Authorization Service
```

Business permissions should not depend directly on Better Auth internals.

---

# 14. Authorization Architecture

ResearchGap uses permission-based authorization.

```text
User
 ↓
Role
 ↓
Access Profile
 ↓
Permissions
```

## Role

Represents organizational responsibility.

Examples:

```text
MENTEE
MENTOR
CEO
COO
CMO
SUPERADMIN
```

## Access Profile

Represents a reusable capability and resource-scope configuration.

Examples:

```text
MENTEE_DEFAULT
MENTOR_DEFAULT
EXECUTIVE_READ
OPERATIONS_FULL
MARKETING_FULL
SUPERADMIN
```

## Permission

Represents one concrete system capability.

Examples:

```text
bootcamp.read
bootcamp.create
bootcamp.update
bootcamp.publish
bootcamp.enrollment.manage

webinar.read
webinar.create
webinar.update
webinar.publish

content.read
content.create
content.update
content.publish

user.approve
user.assign-role
```

## Resource Scope

Represents which resources an actor may use a capability against. Scope does not grant a
capability by itself.

Current scopes include:

```text
ENROLLED
ASSIGNED
OWNED
ALL
```

Bootcamp access uses active enrollment for `ENROLLED`, active Mentor assignment for `ASSIGNED`,
and profile configuration for `ALL`.

---

# 15. Authorization Rule

Business operations must check capabilities and, for resource-specific operations, resource
scope rather than role names.

Conceptually:

```text
authorize(actor, "bootcamp.publish")

then resolve the actor's configured Bootcamp scope and target relationship
```

rather than:

```text
actor.role === "COO"
```

This prevents organizational role changes from leaking throughout business code.

---

# 16. Permission Configuration

Permission and resource-scope definitions should be centralized.

Access profiles map to permissions and resource scopes.

Roles map to default access profiles.

```text
Role
    ↓
Default Access Profile
    ↓
Permission Set + Resource Scopes
```

Changing a role's normal access should primarily require changing centralized access configuration.

---

# 17. Individual Permission Overrides

The architecture should support future individual overrides.

Conceptually:

```text
Effective Permissions
=
Access Profile Permissions
+
Allow Overrides
-
Deny Overrides
```

Dynamic permission management is not required for the initial MVP.

The authorization design must simply avoid preventing this extension later.

---

# 18. Persistence Architecture

PostgreSQL is the persistence technology.

Prisma is the initial ORM implementation.

```text
Application Service
       ↓
Repository Contract
       ↓
Prisma Repository
       ↓
PostgreSQL
```

Application behavior should not depend directly on the database hosting provider.

---

# 19. PostgreSQL Portability

Initial database hosting may use:

> Supabase PostgreSQL

Supabase is treated as infrastructure.

The application should use standard PostgreSQL connectivity through configuration such as:

```text
DATABASE_URL
```

The database should remain portable to:

- self-hosted PostgreSQL,
- Supabase,
- Neon,
- AWS RDS,
- DigitalOcean Managed PostgreSQL,
- or another compatible PostgreSQL provider.

---

# 20. Storage Architecture

File storage should be accessed through a logical application port.

```text
Application
    ↓
FileStorage
    ↓
Storage Adapter
```

Initial implementation may be:

```text
HTTP / Application
        ↓
MediaService
        ↓
FileStorage port
        ↑
SupabaseStorageAdapter
        ↓
Supabase Storage
```

Supabase Storage is the current infrastructure provider, not an application dependency. Only the
infrastructure adapter may depend on the Supabase SDK. Feature services and HTTP clients continue
to use logical `MediaAsset` identifiers and provider-independent media DTOs.

Future implementations may include:

```text
S3StorageAdapter
MinIOStorageAdapter
LocalStorageAdapter
```

These adapters may replace Supabase Storage without changing `MediaService` or feature services.

Business modules should not depend on Supabase bucket conventions or provider-specific URLs.

---

# 21. Media References

Domain entities should reference logical media assets where appropriate rather than treating provider URLs as permanent identity.

Conceptually:

```text
Bootcamp
   ↓
coverAssetId
   ↓
MediaAsset
   ↓
Storage Adapter
```

This allows file storage to change without rewriting domain relationships.

---

# 22. Infrastructure Configuration

External infrastructure must be configured through centralized environment/configuration handling.

Examples include:

- database connection,
- authentication secret,
- storage configuration,
- application URL,
- external service credentials.

Provider-specific configuration should stay inside its adapter or infrastructure module.

---

# 23. Deployment Architecture

## Initial Deployment

The initial MVP may use:

```text
Next.js
   ↓
Vercel

Express
   ↓
Vercel

PostgreSQL
   ↓
Supabase

File Storage
   ↓
Supabase Storage
```

This is a deployment strategy, not an application architecture requirement.

## Vercel Project Topology

Deploy this monorepo as two Vercel projects:

```text
Web project (Root Directory: apps/web)
  /api/*
     -> Next.js rewrite using SERVER_API_ORIGIN
     -> API project /api/*

API project (Root Directory: apps/server)
  -> Express
```

The browser uses the web origin for application and Better Auth requests. `SERVER_API_ORIGIN` is
server-only and points the Next.js rewrite at the API deployment; it must not use a
`NEXT_PUBLIC_` prefix.

Environment ownership:

```text
Web project
  NEXT_PUBLIC_SERVER_URL  public web origin
  SERVER_API_ORIGIN       API deployment origin (server-only)

API project
  DATABASE_URL
  BETTER_AUTH_SECRET
  BETTER_AUTH_URL         public web origin
  CORS_ORIGIN             public web origin
  SUPABASE_URL
  SUPABASE_SECRET_KEY
  SUPABASE_STORAGE_BUCKET
  SUPERADMIN_EMAIL        optional bootstrap input, not a normal runtime requirement
```

Database, authentication, and storage secrets belong only to the API project. This proxy is a
deployment boundary; business and application services remain independent of Vercel.

---

# 24. Self-Hosted Deployment

The same application should be capable of running on self-managed infrastructure.

Example:

```text
Internet
   ↓
Nginx / Caddy
   │
   ├── Next.js
   │
   └── Express
          ↓
      PostgreSQL

Storage
   ↓
MinIO / S3-Compatible Service
```

A single VPS may initially host all components.

---

# 25. Container Compatibility

Even if the initial MVP uses managed platforms, the application should remain suitable for containerized deployment.

Possible future topology:

```text
Docker Compose
├── web
├── server
├── postgres
├── object-storage
└── reverse-proxy
```

Application business logic must not require modification for this transition.

---

# 26. Infrastructure Portability Rule

Moving infrastructure providers should primarily require:

- configuration changes,
- infrastructure adapter changes,
- database migration or restore,
- storage migration,
- deployment configuration changes.

It should not require rewriting application services.

---

# 27. Transaction Boundaries

Operations requiring multiple database writes to succeed together should use explicit transactions.

Transaction decisions belong close to persistence/application orchestration boundaries.

Critical data invariants should also use database constraints where possible.

---

# 28. Domain Integrity

Examples of important invariants include:

- a mentee cannot enroll in the same bootcamp twice,
- invalid enrollment keys cannot produce enrollment,
- expired enrollment keys cannot be used,
- approval status transitions must remain valid,
- unauthorized users cannot execute protected operations.

Important invariants should be enforced beyond frontend validation.

---

# 29. External Services

Future external capabilities should use explicit ports when they become relevant.

Examples:

```text
EmailSender
NotificationPublisher
FileStorage
AnalyticsPublisher
```

Avoid building abstractions before there is a real integration to abstract.

---

# 30. Background Processing

Background workers are not required initially.

They may become useful for:

- email delivery,
- notification processing,
- scheduled jobs,
- media processing,
- analytics aggregation.

When introduced, workers should call shared application services or dedicated use cases rather than duplicating business rules.

---

# 31. Future Service Extraction

A growing module does not automatically justify microservices.

A module should only be considered for extraction when concrete needs emerge, such as:

- independent scaling,
- operational isolation,
- independent deployment requirements,
- significantly different runtime requirements,
- large background workloads,
- ownership by a separate engineering team.

---

# 32. gRPC Strategy

gRPC is not part of the initial MVP.

The application layer should nevertheless remain transport-independent.

Current:

```text
HTTP Controller
      ↓
Application Service
```

Future:

```text
HTTP Handler ─────┐
                  ▼
          Application Service
                  ▲
gRPC Handler ─────┘
```

If a module becomes an independent service:

```text
Main Application
       │
       │ gRPC
       ▼
Extracted Service
```

Business logic should not need to be rewritten solely because the transport changed.

---

# 33. Modular Monolith to Services

Expected evolution:

```text
Stage 1

ResearchGap Backend
├── Users
├── Bootcamps
├── Webinars
├── Content
└── Notifications
```

Possible future:

```text
Stage 2

ResearchGap Backend
├── Users
├── Bootcamps
├── Webinars
└── Content
       │
       │ internal protocol
       ▼
Notification Service
```

Service extraction must remain an optimization based on actual requirements.

---

# 34. Testing Architecture

Tests should primarily protect behavior and architectural boundaries.

Important categories include:

- application service tests,
- authorization tests,
- repository/integration tests,
- API integration tests,
- database constraint tests,
- infrastructure adapter tests where useful.

Application service tests should be possible without requiring HTTP transport.

---

# 35. Architectural Invariants

The following rules should remain true unless this document is intentionally revised:

1. ResearchGap begins as a modular monolith.
2. Business logic does not depend on HTTP-specific objects.
3. Business logic does not depend on Vercel.
4. Business logic does not depend on Supabase-specific database APIs.
5. Application modules do not depend on a specific storage provider.
6. PostgreSQL remains portable across compatible providers.
7. Authentication and authorization remain separate concerns.
8. Authorization checks use permissions rather than scattered role checks.
9. Roles and access profiles remain distinct concepts.
10. Transport-specific behavior stays outside application services.
11. External provider integrations stay at infrastructure boundaries.
12. Infrastructure can be replaced without rewriting application logic.
13. Microservices and gRPC are introduced only when justified by real requirements.

---

# 36. Architecture Evolution

Architecture may evolve as ResearchGap grows.

Changes should be based on observed constraints rather than hypothetical scale.

When changing a fundamental architectural decision, update this document and record the reasoning if the project later adopts Architecture Decision Records.

---

## Core Architecture Principle

> Keep the application core independent from transport and infrastructure, ship as a modular monolith, and preserve clear boundaries so individual parts can be replaced or extracted when real requirements justify it.
