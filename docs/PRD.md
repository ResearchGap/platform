# **ResearchGap — Product Requirements Document**

# **1\. Product Overview**

ResearchGap adalah platform yang mendukung mahasiswa atau mentee dalam mengembangkan kemampuan penelitian melalui program pembelajaran yang dikelola bersama mentor dan tim ResearchGap.

Pada tahap awal, ResearchGap berfungsi menyerupai research-focused learning management platform, dengan fokus pada:

- Bootcamp penelitian.
- Informasi webinar.
- Research news dan educational content.
- Pengelolaan peserta dan program.
- Role-based operational management.

ResearchGap tidak menyelenggarakan webinar secara langsung di dalam platform. Platform hanya menyediakan informasi webinar dan link menuju platform eksternal seperti Zoom, Google Meet, Microsoft Teams, atau registration page lainnya.

## **1.1 User Roles**

Role utama pada ResearchGap:

| Role             | Description                                                                                                               |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------ |
| Mentee           | Pengguna yang mengikuti program dan mengakses konten ResearchGap.                                                         |
| Mentor           | Akademisi, researcher, atau praktisi yang berkontribusi dalam program dan konten ResearchGap.                             |
| CEO              | Staff dengan akses executive monitoring dan oversight platform.                                                           |
| COO              | Staff yang bertanggung jawab terhadap operasional bootcamp, webinar, enrollment, dan program.                             |
| CMO              | Staff yang bertanggung jawab terhadap content, visual, design asset, dan presentation platform.                           |
| CTO / Superadmin | Role sistem dengan administrative access tertinggi, termasuk account approval, role management, dan system configuration. |

Untuk tahap MVP, seorang user diasumsikan memiliki satu primary role.

# **2\. Early Feature Development**

Functional Requirement digunakan sebagai format utama karena lebih mudah digunakan sebagai referensi ketika membuat:

- implementation task,
- API endpoint,
- test case,
- acceptance criteria,
- dan traceability requirement.

Staff tetap menggunakan satu tabel FR, tetapi setiap requirement dibedakan berdasarkan role.

## **2.1 Mentee Functional Requirements**

| ID         | Functional Requirement    | Description                                                                                                        |
| :--------- | :------------------------ | :----------------------------------------------------------------------------------------------------------------- |
| FR-MTE-001 | Mentee Registration       | Sistem harus memungkinkan mentee membuat akun baru.                                                                |
| FR-MTE-002 | Mentee Authentication     | Mentee dapat login dan logout dari sistem.                                                                         |
| FR-MTE-003 | Manage Mentee Profile     | Mentee dapat melihat dan memperbarui informasi profilnya.                                                          |
| FR-MTE-004 | Browse Bootcamps          | Mentee dapat melihat daftar bootcamp yang tersedia.                                                                |
| FR-MTE-005 | View Bootcamp Detail      | Mentee dapat melihat informasi lengkap suatu bootcamp.                                                             |
| FR-MTE-006 | Enroll in Bootcamp        | Mentee dapat melakukan enrollment menggunakan enrollment key yang valid.                                           |
| FR-MTE-007 | View My Bootcamps         | Mentee dapat melihat bootcamp yang sedang atau pernah diikuti.                                                     |
| FR-MTE-008 | View Bootcamp Sessions    | Mentee yang telah terdaftar dapat melihat sesi pada bootcamp yang diikuti.                                         |
| FR-MTE-009 | Access Bootcamp Resources | Mentee dapat mengakses module, meeting link, recording, test, atau resource lain yang tersedia pada sesi bootcamp. |
| FR-MTE-010 | Browse Webinars           | Mentee dapat melihat daftar webinar yang dipublikasikan.                                                           |
| FR-MTE-011 | View Webinar Detail       | Mentee dapat melihat topik, speaker, jadwal, deskripsi, dan informasi webinar.                                     |
| FR-MTE-012 | Access Webinar Link       | Mentee dapat membuka registration atau meeting link eksternal yang tersedia pada webinar.                          |
| FR-MTE-013 | Browse Research Content   | Mentee dapat melihat news, article, atau research content yang dipublikasikan.                                     |
| FR-MTE-014 | View Research Content     | Mentee dapat membaca detail research content.                                                                      |
| FR-MTE-015 | Mentee Dashboard          | Mentee dapat melihat ringkasan bootcamp yang diikuti, upcoming activities, dan informasi terbaru.                  |

## **2.2 Mentor Functional Requirements**

| ID         | Functional Requirement     | Description                                                                                          |
| :--------- | :------------------------- | :--------------------------------------------------------------------------------------------------- |
| FR-MEN-001 | Mentor Registration        | Calon mentor dapat membuat akun dengan status awal pending.                                          |
| FR-MEN-002 | Mentor Account Approval    | Akun mentor harus disetujui Superadmin sebelum memperoleh akses mentor.                              |
| FR-MEN-003 | Mentor Authentication      | Mentor yang telah disetujui dapat login dan logout.                                                  |
| FR-MEN-004 | Manage Mentor Profile      | Mentor dapat mengelola biography, expertise, affiliation, research field, dan informasi profesional. |
| FR-MEN-005 | Create Bootcamp            | Mentor dapat membuat draft bootcamp.                                                                 |
| FR-MEN-006 | Manage Bootcamp            | Mentor dapat memperbarui informasi bootcamp yang dimiliki atau ditugaskan kepadanya.                 |
| FR-MEN-007 | Manage Bootcamp Sessions   | Mentor dapat membuat dan mengubah informasi session dalam bootcamp.                                  |
| FR-MEN-008 | Submit Bootcamp            | Mentor dapat menyerahkan bootcamp untuk diproses atau dipublikasikan oleh staff operasional.         |
| FR-MEN-009 | View Bootcamp Participants | Mentor dapat melihat mentee yang telah terdaftar pada bootcamp.                                      |
| FR-MEN-010 | Create Webinar Information | Mentor dapat membuat draft informasi webinar.                                                        |
| FR-MEN-011 | Manage Webinar Information | Mentor dapat memperbarui webinar yang dibuat atau ditugaskan kepadanya.                              |
| FR-MEN-012 | Create Research Content    | Mentor dapat membuat draft news, article, atau research content.                                     |
| FR-MEN-013 | Manage Research Content    | Mentor dapat melihat dan memperbarui research content yang dibuat.                                   |
| FR-MEN-014 | Mentor Dashboard           | Mentor dapat melihat ringkasan program, sessions, content, dan participant terkait.                  |

Publication dan operational control tidak sepenuhnya diberikan kepada mentor. Operasional final program tetap berada pada staff ResearchGap.

## **2.3 Staff Functional Requirements**

| ID         | Role             | Functional Requirement       | Description                                                                                                     |
| :--------- | :--------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| FR-CEO-001 | CEO              | Executive Dashboard          | CEO dapat melihat ringkasan user, bootcamp, webinar, enrollment, dan aktivitas utama platform.                  |
| FR-CEO-002 | CEO              | View Platform Activity       | CEO dapat melihat informasi program dan aktivitas platform untuk kebutuhan monitoring.                          |
| FR-CEO-003 | CEO              | View User Statistics         | CEO dapat melihat statistik mentee, mentor, dan staff tanpa melakukan operational management secara langsung.   |
| FR-COO-001 | COO              | Manage Bootcamps             | COO dapat melihat, memperbarui, dan mengelola operasional bootcamp.                                             |
| FR-COO-002 | COO              | Publish Bootcamp             | COO dapat mempublikasikan atau menarik publikasi bootcamp.                                                      |
| FR-COO-003 | COO              | Manage Bootcamp Sessions     | COO dapat mengelola jadwal, venue, resource, speaker, dan session information.                                  |
| FR-COO-004 | COO              | Manage Enrollment Key        | COO dapat membuat, mengubah status, atau menonaktifkan enrollment key.                                          |
| FR-COO-005 | COO              | Monitor Enrollment           | COO dapat melihat mentee yang terdaftar pada suatu bootcamp.                                                    |
| FR-COO-006 | COO              | Manage Webinars              | COO dapat mengelola informasi operasional webinar.                                                              |
| FR-COO-007 | COO              | Publish Webinar              | COO dapat mempublikasikan atau menarik publikasi webinar.                                                       |
| FR-COO-008 | COO              | Manage External Webinar Link | COO dapat mengelola registration link, meeting link, atau external resource webinar.                            |
| FR-CMO-001 | CMO              | Manage Content               | CMO dapat membuat dan mengelola news, article, dan marketing content.                                           |
| FR-CMO-002 | CMO              | Publish Content              | CMO dapat mengatur publication status research atau marketing content.                                          |
| FR-CMO-003 | CMO              | Manage Program Visual        | CMO dapat mengelola cover image dan visual asset untuk bootcamp dan webinar.                                    |
| FR-CMO-004 | CMO              | Manage Homepage Content      | CMO dapat mengelola konten yang ditampilkan pada homepage atau promotional section.                             |
| FR-CMO-005 | CMO              | Manage Content Presentation  | CMO dapat mengelola copy, visual, dan presentation-related information tanpa mengubah operational data program. |
| FR-ADM-001 | CTO / Superadmin | Approve Mentor               | Superadmin dapat menyetujui atau menolak registrasi mentor.                                                     |
| FR-ADM-002 | CTO / Superadmin | Approve Staff                | Superadmin dapat menyetujui atau menolak registrasi staff.                                                      |
| FR-ADM-003 | CTO / Superadmin | Manage Users                 | Superadmin dapat melihat dan mengelola seluruh akun pengguna.                                                   |
| FR-ADM-004 | CTO / Superadmin | Assign Staff Role            | Superadmin dapat menentukan role CEO, COO, CMO, atau role administratif lainnya kepada staff.                   |
| FR-ADM-005 | CTO / Superadmin | Manage Account Status        | Superadmin dapat mengaktifkan, menonaktifkan, atau melakukan administrative action terhadap akun.               |
| FR-ADM-006 | CTO / Superadmin | Manage System Settings       | Superadmin dapat mengelola konfigurasi platform yang bersifat administratif.                                    |
| FR-ADM-007 | CTO / Superadmin | Full Administrative Access   | Superadmin dapat mengakses seluruh administrative functionality untuk kebutuhan maintenance dan recovery.       |

## **2.4 Authorization & Permission Strategy**

ResearchGap menggunakan permission-based authorization. Business logic tidak boleh melakukan authorization berdasarkan role secara langsung.

Hindari:

if (user.role \=== "COO") {

// publish bootcamp

}

Gunakan:

authorize(user, "bootcamp.publish")

Dengan pendekatan ini, application feature hanya mengetahui permission yang dibutuhkan dan tidak bergantung pada struktur organisasi seperti CEO, COO, atau CMO.

### **Permission Architecture**

Authorization dibagi menjadi empat komponen:

User  
 │  
 ▼  
Role  
 │  
 ▼  
Access Profile  
 │  
 ▼  
Permissions

Contoh:

COO  
 │  
 ▼  
OPERATIONS_FULL  
 │  
 ├── bootcamp.read  
 ├── bootcamp.create  
 ├── bootcamp.update  
 ├── bootcamp.publish  
 ├── bootcamp.enrollment.manage  
 ├── webinar.read  
 ├── webinar.create  
 ├── webinar.update  
 └── webinar.publish

### **Permission Catalog**

Seluruh permission key didefinisikan secara terpusat.

PERMISSIONS \= {  
 BOOTCAMP_READ: "bootcamp.read",  
 BOOTCAMP_CREATE: "bootcamp.create",  
 BOOTCAMP_UPDATE: "bootcamp.update",  
 BOOTCAMP_PUBLISH: "bootcamp.publish",  
 BOOTCAMP_MANAGE_ENROLLMENT: "bootcamp.enrollment.manage",

WEBINAR_READ: "webinar.read",  
 WEBINAR_CREATE: "webinar.create",  
 WEBINAR_UPDATE: "webinar.update",  
 WEBINAR_PUBLISH: "webinar.publish",

CONTENT_READ: "content.read",  
 CONTENT_CREATE: "content.create",  
 CONTENT_UPDATE: "content.update",  
 CONTENT_PUBLISH: "content.publish",  
 CONTENT_MANAGE_VISUAL: "content.visual.manage",

USER_READ: "user.read",  
 USER_APPROVE: "user.approve",  
 USER_UPDATE: "user.update",  
 USER_ASSIGN_ROLE: "user.assign-role",

ANALYTICS_READ_EXECUTIVE: "analytics.executive.read",

SYSTEM_MANAGE: "system.manage",  
}

### **Access Profiles**

Permission tidak ditulis berulang pada setiap user. Permission dikelompokkan menjadi reusable access profile.

Contoh:

ACCESS_PROFILES \= {  
 MENTEE_DEFAULT: \[  
 // mentee permissions  
 \],

MENTOR_DEFAULT: \[  
 // mentor permissions  
 \],

EXECUTIVE_READ: \[  
 "analytics.executive.read",  
 "bootcamp.read",  
 "webinar.read",  
 "content.read",  
 \],

OPERATIONS_FULL: \[  
 "bootcamp.read",  
 "bootcamp.create",  
 "bootcamp.update",  
 "bootcamp.publish",  
 "bootcamp.enrollment.manage",  
 "webinar.read",  
 "webinar.create",  
 "webinar.update",  
 "webinar.publish",  
 \],

MARKETING_FULL: \[  
 "content.read",  
 "content.create",  
 "content.update",  
 "content.publish",  
 "content.visual.manage",  
 \],

SUPERADMIN: \[  
 "\*",  
 \],  
}

### **Default Role Mapping**

Role hanya menentukan default access profile.

ROLE_ACCESS \= {  
 MENTEE: "MENTEE_DEFAULT",  
 MENTOR: "MENTOR_DEFAULT",  
 CEO: "EXECUTIVE_READ",  
 COO: "OPERATIONS_FULL",  
 CMO: "MARKETING_FULL",  
 SUPERADMIN: "SUPERADMIN",  
}

Dengan demikian, perubahan permission suatu role hanya membutuhkan perubahan pada satu definition.

Misalnya CEO nantinya diperbolehkan mempublikasikan webinar:

EXECUTIVE_READ: \[  
 ...  
 "webinar.publish",  
\]

Business route dan service tidak perlu diubah.

### **Individual Access Profile**

Setiap user memiliki accessProfileCode.

Contoh:

roleCode \= COO

accessProfileCode \= OPERATIONS_FULL

Hal ini memungkinkan permission bundle seorang user diubah tanpa membuat role baru.

Contoh:

roleCode \= COO

accessProfileCode \= OPERATIONS_LIMITED

Role tetap merepresentasikan posisi organisasi, sedangkan access profile merepresentasikan kemampuan sistem.

### **Future User Permission Override**

Architecture harus memungkinkan individual override pada masa mendatang:

Effective Permission \= Access Profile Permissions \+ User Allow Overrides \- User Deny Overrides

Contoh:

Role: COO

Profile: OPERATIONS_FULL

Deny:

bootcamp.publish

Fitur override belum membutuhkan management UI pada MVP, tetapi data model dan authorization service harus memungkinkan penambahannya tanpa mengubah business logic.

#

# **3\. MVP Scope**

## **3.1 In Scope**

MVP ResearchGap mencakup:

### **Authentication & Account**

- Mentee registration.
- Mentor registration dan approval.
- Staff registration dan approval.
- Login/logout.
- Session management.
- Profile management.
- Account status management.
- Role-Based Access Control.

### **Bootcamp**

- Create dan edit bootcamp.
- Publication workflow.
- Bootcamp detail.
- Bootcamp sessions.
- Enrollment key.
- Bootcamp enrollment.
- Participant list.
- Module/resource links.
- Pre-test/post-test/feedback links.
- Recording link.

### **Webinar**

- Create webinar information.
- Edit webinar information.
- Publication.
- Speaker information.
- Schedule.
- Cover image.
- External registration link.
- External meeting link.

Webinar tidak diselenggarakan secara native di ResearchGap.

### **Content**

- News.
- Research article/content.
- Homepage content.
- Program visual asset.

### **Staff Administration**

- CEO dashboard.
- COO operational dashboard.
- CMO content/design management.
- Superadmin account approval.
- Role assignment.
- Account management.

## **3.2 Out of Scope**

Fitur berikut belum termasuk MVP:

- Payment gateway.
- Premium mentee.
- Native video conferencing.
- Direct mentee–mentor marketplace.
- Browse mentor directory.
- One-to-one mentoring system.
- Chat/messaging.
- Co-author marketplace.
- Research collaboration workspace.
- AI recommendation.
- Automated mentor matching.
- Certificate generation.
- Native quiz engine.
- Dynamic permission builder.
- Mobile application.

Beberapa fitur lama seperti Mentoring dan Coauthor pada database beta dipertahankan sebagai referensi, tetapi tidak dimigrasikan ke core MVP sampai product flow-nya didefinisikan kembali.

#

# **4\. Proposed Tech Stack**

## **4.1 Frontend**

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query

## **4.2 Backend**

- Express.js
- TypeScript
- Bun Runtime
- REST API
- Prisma ORM

### **Backend Architecture**

ResearchGap dikembangkan sebagai modular monolith dengan separation antara:

Transport  
 │  
 ▼  
Application / Service  
 │  
 ▼  
Repository / Port  
 │  
 ▼  
Infrastructure Adapter

Business service tidak boleh bergantung langsung pada:

- Express Request / Response
- Vercel runtime
- Supabase SDK
- storage provider tertentu
- gRPC
- HTTP-specific implementation

Contoh:

HTTP Controller  
 │  
 ▼  
BootcampService  
 │  
 ▼  
BootcampRepository  
 │  
 ▼  
PrismaBootcampRepository

BootcampService hanya mengetahui interface BootcampRepository, bukan Prisma implementation.

### **API Strategy**

Client-facing API pada MVP menggunakan:

REST over HTTP/JSON

REST merupakan transport layer dan bukan tempat business logic.

Contoh:

POST /bootcamps/:id/publish  
 │  
 ▼  
HTTP Controller  
 │  
 ▼  
authorization.authorize("bootcamp.publish")  
 │  
 ▼  
BootcampService.publish()

### **Future gRPC Support**

gRPC tidak diimplementasikan pada MVP, tetapi application layer harus dibuat transport-agnostic sehingga gRPC handler dapat ditambahkan tanpa memindahkan business logic.

Future architecture:

REST Handler ───────┐  
 │  
 ▼  
 Application Service  
 ▲  
 │  
gRPC Handler ───────┘

Jika suatu module kemudian dipisahkan menjadi independent service:

Main Backend  
 │  
 │ gRPC  
 ▼  
Notification Service

Main Backend  
 │  
 │ gRPC  
 ▼  
Analytics Service

Dengan demikian, adopsi gRPC dilakukan berdasarkan kebutuhan service-to-service communication, bukan sekadar karena ukuran codebase bertambah.

## **4.3 Authentication & Authorization**

### **Authentication**

Authentication menggunakan:

Better Auth

Better Auth bertanggung jawab terhadap:

- User identity
- Email/password authentication
- Session management
- Authentication account
- Verification
- Authentication lifecycle

### **Application Authorization**

Better Auth bukan source of truth untuk business permission ResearchGap.

Authorization dikelola oleh application layer ResearchGap melalui:

- roleCode
- accessProfileCode
- permission catalog
- access profile definitions
- authorization service
- optional individual overrides

Sehingga architecture menjadi:

Better Auth  
 │  
 ▼  
Authenticated User ID  
 │  
 ▼  
ResearchGap UserAccess  
 │  
 ├── roleCode  
 ├── accessProfileCode  
 └── accountStatus  
 │  
 ▼  
Authorization Service

Dengan separation ini, penggantian authentication provider di masa mendatang tidak mengharuskan perubahan pada permission system.

## **4.4 Database**

- PostgreSQL
- Prisma ORM
- Supabase PostgreSQL sebagai initial managed database.

Supabase hanya merupakan hosting provider PostgreSQL, bukan dependency business logic.

Application menggunakan standard PostgreSQL connection melalui:

DATABASE_URL

Application service tidak diperbolehkan mengakses Supabase database SDK secara langsung.

Database access dilakukan melalui:

Application Service  
 │  
 ▼  
Repository Interface  
 │  
 ▼  
Prisma Repository  
 │  
 ▼  
PostgreSQL

Dengan demikian database dapat dipindahkan dari Supabase PostgreSQL ke Self-hosted PostgreSQL / DigitalOcean Managed PostgreSQL / AWS RDS / Neon atau PostgreSQL provider lainnya tanpa mengubah business service.

## **4.5 Storage Abstraction**

File storage juga harus diperlakukan sebagai external infrastructure.

Application menggunakan interface:

interface FileStorage {  
 upload(...)  
 delete(...)  
 getUrl(...)  
}

Initial implementation:

FileStorage  
 │  
 ▼  
SupabaseStorageAdapter

Future implementation dapat diganti menjadi:

FileStorage  
 ├── S3StorageAdapter  
 ├── MinIOStorageAdapter  
 └── LocalStorageAdapter

Business logic tidak boleh menyimpan asumsi mengenai Supabase bucket atau Supabase URL.

## **4.6 Monorepo**

- Turborepo
- Bun Workspace
- Shared packages untuk database, authentication, configuration, environment, dan UI.

Better-T-Stack menghasilkan struktur apps/\* dan packages/\*; dengan pilihan Express, Next.js, Better Auth, Prisma, dan Turborepo, aplikasi web dan server tetap menjadi application terpisah dalam satu monorepo.

#

# **5\. Project Initialization**

Repository:

researchgap/platform

Initial project dibuat tanpa deployment-specific scaffold agar codebase tidak terikat dengan Vercel sejak initialization.

bun create better-t-stack@latest platform \\  
 \--frontend next \\  
 \--backend express \\  
 \--runtime bun \\  
 \--api none \\  
 \--auth better-auth \\  
 \--payments none \\  
 \--database postgres \\  
 \--orm prisma \\  
 \--db-setup supabase \\  
 \--package-manager bun \\  
 \--git \\  
 \--web-deploy none \\  
 \--server-deploy none \\  
 \--install \\  
 \--addons skills turborepo \\  
 \--examples none

\--api none digunakan karena ResearchGap menggunakan custom REST API melalui Express.

Deployment configuration dikelola terpisah dari application architecture.

Initial deployment tetap dapat menggunakan:

Frontend → Vercel

Backend → Vercel

Database → Supabase

tanpa menjadikan ketiga provider tersebut sebagai requirement application.

#

# **6\. Proposed Project Structure**

platform/  
│  
├── apps/  
│ │  
│ ├── web/  
│ │ └── src/  
│ │ ├── app/  
│ │ ├── components/  
│ │ ├── features/  
│ │ └── lib/  
│ │  
│ └── server/  
│ └── src/  
│ │  
│ ├── modules/  
│ │ ├── users/  
│ │ │ ├── user.service.ts  
│ │ │ ├── user.repository.ts  
│ │ │ ├── user.schema.ts  
│ │ │ └── user.types.ts  
│ │ │  
│ │ ├── bootcamps/  
│ │ ├── enrollments/  
│ │ ├── webinars/  
│ │ ├── content/  
│ │ └── dashboard/  
│ │  
│ ├── authorization/  
│ │ ├── permissions.ts  
│ │ ├── access-profiles.ts  
│ │ ├── roles.ts  
│ │ ├── authorize.ts  
│ │ └── authorization.types.ts  
│ │  
│ ├── transport/  
│ │ └── http/  
│ │ ├── routes/  
│ │ ├── controllers/  
│ │ └── middleware/  
│ │  
│ ├── infrastructure/  
│ │ ├── auth/  
│ │ │ └── better-auth/  
│ │ │  
│ │ ├── database/  
│ │ │ └── prisma/  
│ │ │ └── repositories/  
│ │ │  
│ │ └── storage/  
│ │ └── supabase/  
│ │  
│ ├── config/  
│ └── index.ts  
│  
├── packages/  
│ ├── auth/  
│ ├── db/  
│ ├── contracts/  
│ ├── env/  
│ ├── config/  
│ └── ui/  
│  
├── turbo.json  
├── bts.jsonc  
└── package.json

Module Boundary Rules

Business service:

- tidak menerima Express Request atau Response;
- tidak melakukan Prisma query secara langsung;
- tidak memanggil Supabase SDK secara langsung;
- tidak mengetahui deployment environment;
- tidak bergantung pada Vercel API;
- tidak bergantung pada HTTP transport.

Infrastructure implementation berada di infrastructure/.

Transport implementation berada di transport/.

Jika gRPC diperlukan di masa mendatang:

transport/  
├── http/  
└── grpc/

tanpa memindahkan application service.

#

# **7\. Proposed Data Schema**

Schema berikut merupakan revisi terhadap beta schema ResearchGap.

## **7.1 Authentication Tables**

Table authentication dikelola oleh Better Auth.

| Entity       | Purpose                                             |
| :----------- | :-------------------------------------------------- |
| User         | Identity utama pengguna.                            |
| Session      | Authentication session.                             |
| Account      | Credential atau authentication provider account.    |
| Verification | Verification token dan authentication verification. |

Password tidak lagi disimpan pada custom ResearchGap user table.

## **7.2 UserProfile**

| Field         | Type     | Constraint | Description                       |
| :------------ | :------- | :--------- | :-------------------------------- |
| id            | String   | PK         | Profile identifier.               |
| userId        | String   | FK, Unique | Reference ke Better Auth User.    |
| nickname      | String   | Nullable   | Nama panggilan.                   |
| whatsapp      | String   | Nullable   | Contact number.                   |
| institution   | String   | Nullable   | Institusi pengguna.               |
| researchField | String   | Nullable   | Bidang penelitian.                |
| biography     | Text     | Nullable   | Biography, terutama untuk mentor. |
| expertise     | Text     | Nullable   | Expertise mentor.                 |
| affiliation   | String   | Nullable   | Affiliation mentor.               |
| createdAt     | DateTime | Required   | Creation timestamp.               |
| updatedAt     | DateTime | Required   | Last update timestamp.            |

## **7.3 UserAccess**

UserAccess menjadi source of truth authorization ResearchGap.

| Field             | Type     | Constraint | Description                                |
| :---------------- | :------- | :--------- | :----------------------------------------- |
| userId            | String   | PK, FK     | Reference ke User.                         |
| roleCode          | String   | Required   | Organizational role.                       |
| accessProfileCode | String   | Required   | Permission bundle yang digunakan user.     |
| accountStatus     | Enum     | Required   | PENDING, ACTIVE, SUSPENDED, atau DISABLED. |
| updatedAt         | DateTime | Required   | Last authorization update.                 |

Contoh:

userId \= xxx

roleCode \= COO

accessProfileCode \= OPERATIONS_FULL

Role dan access profile sengaja dipisahkan agar perubahan kemampuan user tidak membutuhkan pembuatan role baru.

## **7.4 AccountApproval**

| Field             | Type     | Constraint   | Description                       |
| :---------------- | :------- | :----------- | :-------------------------------- |
| id                | String   | PK           | Approval identifier.              |
| userId            | String   | FK           | User yang meminta approval.       |
| requestedRoleCode | String   | Required     | Role yang diminta.                |
| status            | Enum     | Required     | PENDING, APPROVED, atau REJECTED. |
| reviewedById      | String   | FK, Nullable | Superadmin reviewer.              |
| reviewedAt        | DateTime | Nullable     | Review timestamp.                 |
| reviewNote        | Text     | Nullable     | Reason atau catatan review.       |
| createdAt         | DateTime | Required     | Request timestamp.                |

## **7.5 UserPermissionOverride**

Table ini disiapkan untuk future granular permission customization dan tidak wajib digunakan pada initial MVP.

| Field         | Type     | Constraint | Description                       |
| :------------ | :------- | :--------- | :-------------------------------- |
| id            | String   | PK         | Override identifier.              |
| userId        | String   | FK         | Target user.                      |
| permissionKey | String   | Required   | Contoh bootcamp.publish.          |
| effect        | Enum     | Required   | ALLOW atau DENY.                  |
| reason        | Text     | Nullable   | Alasan override.                  |
| expiresAt     | DateTime | Nullable   | Optional temporary permission.    |
| createdById   | String   | FK         | Superadmin yang membuat override. |
| createdAt     | DateTime | Required   | Creation timestamp.               |

## **7.6 MediaAsset**

Media metadata dipisahkan dari provider storage.

| Field        | Type     | Constraint   | Description                              |
| :----------- | :------- | :----------- | :--------------------------------------- |
| id           | String   | PK           | Asset identifier.                        |
| createdById  | String   | FK, Nullable | Asset uploader.                          |
| sourceType   | Enum     | Required     | MANAGED atau EXTERNAL.                   |
| storageKey   | String   | Nullable     | Logical object storage key.              |
| externalUrl  | String   | Nullable     | Digunakan untuk externally hosted asset. |
| originalName | String   | Nullable     | Original filename.                       |
| mimeType     | String   | Nullable     | File MIME type.                          |
| createdAt    | DateTime | Required     | Upload timestamp.                        |

Domain entity seperti Bootcamp tidak menyimpan Supabase URL secara langsung, tetapi reference ke MediaAsset.

## **7.7 Bootcamp**

| Field                | Type     | Constraint   | Description                                    |
| :------------------- | :------- | :----------- | :--------------------------------------------- |
| id                   | String   | PK           | Bootcamp identifier.                           |
| title                | String   | Required     | Bootcamp title.                                |
| slug                 | String   | Unique       | Public URL slug.                               |
| description          | Text     | Required     | Description.                                   |
| whatYouGet           | Text     | Nullable     | Benefit/program information.                   |
| startDate            | DateTime | Required     | Start date.                                    |
| endDate              | DateTime | Required     | End date.                                      |
| registrationDeadline | DateTime | Nullable     | Enrollment deadline.                           |
| coverAssetId         | String   | FK, Nullable | Cover image.                                   |
| status               | Enum     | Required     | DRAFT, REVIEW, PUBLISHED, COMPLETED, ARCHIVED. |
| createdById          | String   | FK           | Creator.                                       |
| publishedById        | String   | FK, Nullable | Staff yang mempublikasikan.                    |
| publishedAt          | DateTime | Nullable     | Publication timestamp.                         |
| createdAt            | DateTime | Required     | Creation timestamp.                            |
| updatedAt            | DateTime | Required     | Last update.                                   |

Enroll_Code tidak lagi disimpan pada Bootcamp.

## **7.8 BootcampSession**

Nama BootcampSession digunakan agar tidak bertabrakan dengan Better Auth Session.

| Field        | Type     | Constraint   | Description                      |
| :----------- | :------- | :----------- | :------------------------------- |
| id           | String   | PK           | Session identifier.              |
| bootcampId   | String   | FK           | Parent bootcamp.                 |
| title        | String   | Required     | Session title.                   |
| description  | Text     | Nullable     | Session description.             |
| speakerName  | String   | Nullable     | Speaker.                         |
| scheduledAt  | DateTime | Required     | Session schedule.                |
| sessionType  | Enum     | Required     | ONLINE, OFFLINE, atau HYBRID.    |
| venue        | String   | Nullable     | Venue atau meeting information.  |
| preTestUrl   | String   | Nullable     | External pre-test.               |
| postTestUrl  | String   | Nullable     | External post-test.              |
| feedbackUrl  | String   | Nullable     | Feedback link.                   |
| moduleUrl    | String   | Nullable     | Module/resource link.            |
| recordingUrl | String   | Nullable     | Recording link.                  |
| coverAssetId | String   | FK, Nullable | Session cover.                   |
| sortOrder    | Integer  | Required     | Ordering session dalam bootcamp. |
| createdAt    | DateTime | Required     | Creation timestamp.              |
| updatedAt    | DateTime | Required     | Last update.                     |

## **7.9 EnrollmentKey**

| Field       | Type     | Constraint | Description                       |
| :---------- | :------- | :--------- | :-------------------------------- |
| id          | String   | PK         | Enrollment key identifier.        |
| bootcampId  | String   | FK         | Target bootcamp.                  |
| codeHash    | String   | Required   | Hashed enrollment code.           |
| keyHint     | String   | Nullable   | Safe identifier/hint untuk staff. |
| status      | Enum     | Required   | ACTIVE, INACTIVE, atau EXPIRED.   |
| expiresAt   | DateTime | Nullable   | Optional expiration.              |
| maxUses     | Integer  | Nullable   | Optional usage limit.             |
| usageCount  | Integer  | Required   | Current usage count.              |
| createdById | String   | FK         | Staff pembuat key.                |
| createdAt   | DateTime | Required   | Creation timestamp.               |

Raw enrollment key tidak perlu disimpan secara plaintext.

## **7.10 BootcampEnrollment**

| Field           | Type     | Constraint | Description                        |
| :-------------- | :------- | :--------- | :--------------------------------- |
| id              | String   | PK         | Enrollment identifier.             |
| bootcampId      | String   | FK         | Bootcamp.                          |
| menteeId        | String   | FK         | Enrolled mentee.                   |
| enrollmentKeyId | String   | FK         | Key yang digunakan.                |
| status          | Enum     | Required   | ACTIVE, COMPLETED, atau CANCELLED. |
| enrolledAt      | DateTime | Required   | Enrollment timestamp.              |

Unique constraint: bootcampId \+ menteeId untuk mencegah duplicate enrollment.

## **7.11 Webinar**

| Field           | Type     | Constraint   | Description                            |
| :-------------- | :------- | :----------- | :------------------------------------- |
| id              | String   | PK           | Webinar identifier.                    |
| title           | String   | Required     | Webinar title.                         |
| slug            | String   | Unique       | Public URL slug.                       |
| description     | Text     | Required     | Webinar description.                   |
| speakerName     | String   | Nullable     | Speaker information.                   |
| scheduledAt     | DateTime | Required     | Webinar schedule.                      |
| sessionType     | Enum     | Required     | ONLINE, OFFLINE, atau HYBRID.          |
| venue           | String   | Nullable     | Venue information.                     |
| registrationUrl | String   | Nullable     | External registration link.            |
| meetingUrl      | String   | Nullable     | External webinar link.                 |
| coverAssetId    | String   | FK, Nullable | Cover asset.                           |
| status          | Enum     | Required     | DRAFT, PUBLISHED, COMPLETED, ARCHIVED. |
| createdById     | String   | FK           | Creator.                               |
| publishedById   | String   | FK, Nullable | Publisher.                             |
| publishedAt     | DateTime | Nullable     | Publication timestamp.                 |
| createdAt       | DateTime | Required     | Creation timestamp.                    |
| updatedAt       | DateTime | Required     | Last update.                           |

## **7.12 ResearchContent**

| Field         | Type     | Constraint   | Description                       |
| :------------ | :------- | :----------- | :-------------------------------- |
| id            | String   | PK           | Content identifier.               |
| title         | String   | Required     | Content title.                    |
| slug          | String   | Unique       | Public URL slug.                  |
| excerpt       | Text     | Nullable     | Short description.                |
| content       | Text     | Required     | Main content.                     |
| contentType   | Enum     | Required     | NEWS, ARTICLE, atau ANNOUNCEMENT. |
| coverAssetId  | String   | FK, Nullable | Cover asset.                      |
| status        | Enum     | Required     | DRAFT, PUBLISHED, atau ARCHIVED.  |
| authorId      | String   | FK           | Content creator.                  |
| publishedById | String   | FK, Nullable | Publisher.                        |
| publishedAt   | DateTime | Nullable     | Publication timestamp.            |
| createdAt     | DateTime | Required     | Creation timestamp.               |
| updatedAt     | DateTime | Required     | Last update.                      |

## **7.13 Category**

| Field | Type   | Constraint | Description          |
| :---- | :----- | :--------- | :------------------- |
| id    | String | PK         | Category identifier. |
| name  | String | Required   | Category name.       |
| slug  | String | Unique     | Category slug.       |

Many-to-many relations menggunakan join table:

| Table                   | Relation                   |
| :---------------------- | :------------------------- |
| BootcampCategory        | Bootcamp ↔ Category        |
| WebinarCategory         | Webinar ↔ Category         |
| ResearchContentCategory | ResearchContent ↔ Category |

## **7.14 SiteSetting**

| Field       | Type      | Constraint   | Description          |
| :---------- | :-------- | :----------- | :------------------- |
| key         | String    | PK           | Configuration key.   |
| value       | JSON/Text | Required     | Configuration value. |
| updatedById | String    | FK, Nullable | Last editor.         |
| updatedAt   | DateTime  | Required     | Last update.         |

## **7.15 AuditLog**

| Field        | Type     | Constraint   | Description             |
| :----------- | :------- | :----------- | :---------------------- |
| id           | String   | PK           | Log identifier.         |
| actorId      | String   | FK, Nullable | User performing action. |
| action       | String   | Required     | Action identifier.      |
| resourceType | String   | Required     | Resource type.          |
| resourceId   | String   | Nullable     | Target resource.        |
| metadata     | JSON     | Nullable     | Additional information. |
| createdAt    | DateTime | Required     | Action timestamp.       |

Digunakan terutama untuk aktivitas seperti:

- mentor approval;
- staff approval;
- role change;
- access profile change;
- account suspension;
- program publication.

## **7.16 Beta Schema Migration Mapping**

| Beta Schema           | New Schema                                    | Change                                                   |
| :-------------------- | :-------------------------------------------- | :------------------------------------------------------- |
| USERS                 | Better Auth User \+ UserProfile \+ UserAccess | Password dan authorization dipisahkan dari profile.      |
| ROLES                 | Code-defined Role \+ Access Profile           | Comma-separated permission di database dihapus.          |
| BOOTCAMPS.Enroll_Code | EnrollmentKey                                 | Enrollment key memiliki lifecycle tersendiri.            |
| SESSIONS              | BootcampSession                               | Rename untuk menghindari konflik authentication Session. |
| ENROLLMENTS           | BootcampEnrollment                            | Reference langsung ke EnrollmentKey.                     |
| HOME_NEWS             | ResearchContent                               | Dibuat generic untuk news/article/announcement.          |
| HOME_SETTINGS         | SiteSetting                                   | Dipertahankan dalam bentuk generic configuration.        |
| Raw image URL         | MediaAsset                                    | Storage dibuat provider-independent.                     |
| SHEET_MENTORING       | Deferred                                      | Tidak termasuk MVP.                                      |
| SHEET_COAUTHOR        | Deferred                                      | Tidak termasuk MVP.                                      |
| Premium Mentee        | Removed from MVP                              | Belum terdapat payment/premium model.                    |

#

# **8\. Core Data Relationships**

User  
├── UserProfile  
├── AccountApproval  
├── BootcampEnrollment  
├── Bootcamp (createdBy)  
├── Webinar (createdBy)  
└── ResearchContent (authorId)

Bootcamp  
├── BootcampSession  
├── EnrollmentKey  
├── BootcampEnrollment  
└── Category

Webinar  
└── Category

ResearchContent  
└── Category

#

# **9\. Hosting & Database**

## **9.1 Early Development / MVP**

                   Vercel
              ┌───────────────┐
              │               │
        Next.js Web      Express API
              │               │
              └───────┬───────┘
                      │
                      ▼
             Supabase PostgreSQL
                      │
                      ▼
               Supabase Storage

| Component    | Platform            |
| :----------- | :------------------ |
| Frontend     | Vercel              |
| Backend      | Vercel              |
| Database     | Supabase PostgreSQL |
| File Storage | Supabase Storage    |
| Repository   | GitHub              |

## **9.2 VPS Scale-Up**

Ketika aplikasi membutuhkan infrastructure control yang lebih besar, seluruh stack dapat dipindahkan ke satu VPS.

VPS  
│  
├── Reverse Proxy  
│ └── Nginx / Caddy  
│  
├── Next.js  
├── Express.js  
├── PostgreSQL  
└── Storage

Recommended deployment model:

Docker Compose  
├── web  
├── server  
├── postgres  
└── nginx

### **VPS Provider Comparison**

| Provider        | Strength                                       | Consideration                            | ResearchGap Fit        |
| :-------------- | :--------------------------------------------- | :--------------------------------------- | :--------------------- |
| DigitalOcean    | Developer friendly dan dokumentasi baik        | Cost/resource tidak selalu paling murah  | Strong                 |
| Akamai / Linode | Mature infrastructure dan tersedia region Asia | Regional pricing dapat lebih tinggi      | Strong                 |
| AWS Lightsail   | Mudah menjadi entry point ke AWS               | Infrastructure dapat berkembang kompleks | Strong                 |
| Biznet Gio      | Indonesian data center dan local payment       | Ecosystem lebih kecil                    | Strong untuk Indonesia |
| IDCloudHost     | Local provider dan entry cost rendah           | Perlu evaluasi resource tiap plan        | Good                   |

Initial migration strategy:

MVP  
Vercel \+ Supabase  
 │  
 ▼  
Initial Production  
Single VPS  
FE \+ BE \+ PostgreSQL  
 │  
 ▼  
Future Scale

Separate services only when required

# **10\. Development Roadmap**

Roadmap ini bersifat implementation roadmap, sehingga belum membutuhkan tanggal spesifik. Timeline dapat diberikan setelah kapasitas team dan target launch ditentukan.

## **Phase 1 — Project Foundation**

Scope:

- Initialize Better-T-Stack monorepo.
- Setup Next.js dan Express.
- Setup Bun runtime.
- Setup Prisma dan PostgreSQL.
- Connect initial Supabase database.
- Establish modular backend boundaries.
- Create repository interfaces.
- Create storage interface.
- Separate HTTP transport from application services.
- Setup centralized environment configuration.
- Create packages/contracts.
- Setup health/readiness endpoint.
- Prepare Docker-compatible application configuration.
- Ensure application core contains no Vercel-specific dependency.

### **Deliverable**

Portable modular-monolith foundation

with Web \+ Server \+ PostgreSQL running locally.

## **Phase 2 — Authentication & Authorization**

### **Scope**

- Setup Better Auth.
- Email/password authentication.
- Session management.
- Mentee registration.
- Mentor registration.
- Staff registration.
- Account approval workflow.
- Create UserProfile.
- Create UserAccess.
- Define centralized permission catalog.
- Define access profiles.
- Define role → default access profile mapping.
- Implement authorize(permission) service.
- Implement HTTP authorization middleware.
- Protect routes based on permission rather than role.
- Superadmin account management.
- Audit authorization-sensitive operations.
- Prepare authorization service for future per-user override.

### **Deliverable**

Provider-independent identity integration \+ centralized modular authorization layer.

## **Phase 3 — Content & Webinar**

### **Scope**

- Research content CRUD.
- Content publication workflow.
- Homepage content.
- Webinar CRUD.
- Webinar publication.
- External registration/meeting link.
- Cover image management.
- CMO content workflow.
- COO webinar operational workflow.
- Public webinar and content browsing.

### **Deliverable**

ResearchGap information platform operational

## **Phase 4 — Bootcamp Core**

### **Scope**

- Bootcamp CRUD.
- Bootcamp publication workflow.
- Bootcamp sessions.
- Enrollment key management.
- Enrollment validation.
- Participant management.
- Mentee enrolled bootcamp dashboard.
- Session resources.
- Module links.
- Pre-test/post-test.
- Feedback link.
- Recording links.

### **Deliverable**

Complete bootcamp lifecycle

## **Phase 5 — Core Frontend Integration**

### **Scope**

- Establish shared frontend application shell and reusable UI components based on `style-guide.md`.
- Authentication interface:
  - Login.
  - Mentee registration.
  - Mentor registration.
  - Staff registration.
  - Pending approval state.
  - Rejected account state.
  - Suspended/disabled account state.

- User profile interface.
- Public Research Content:
  - Content listing.
  - Content detail.

- Public Webinar:
  - Webinar listing.
  - Webinar detail.
  - External registration access.

- Public Bootcamp:
  - Bootcamp listing.
  - Bootcamp detail.

- Mentee dashboard.
- Mentee bootcamp enrollment using enrollment key.
- My Bootcamps.
- Bootcamp learning/session view.
- Session resources:
  - Module links.
  - Pre-test/post-test.
  - Feedback links.
  - Recording links.

- Mentor dashboard.
- Mentor bootcamp management interface.
- Mentor bootcamp session management interface.
- Mentor participant view.
- Mentor Research Content management interface.
- Mentor Webinar management interface.
- Loading, empty, error, and permission-denied states.
- Responsive frontend implementation.

### **Deliverable**

Complete core user-facing experience for Public User, Mentee, and Mentor.

---

## **Phase 6 — Staff Operations & Dashboard**

### **Scope**

#### **CEO**

- Executive dashboard.
- Platform overview.
- User statistics.
- Bootcamp statistics.
- Webinar statistics.
- Enrollment statistics.
- Read-only operational insights.

#### **COO**

- Operational dashboard.
- Bootcamp management interface.
- Bootcamp publication management.
- Bootcamp session management.
- Enrollment key management.
- Participant and enrollment monitoring.
- Webinar management interface.
- Webinar publication management.

#### **CMO**

- Content dashboard.
- Research Content management.
- Research Content publication.
- Bootcamp visual asset management.
- Webinar visual asset management.
- Homepage and promotional content management.

#### **CTO / Superadmin**

- Administrative dashboard.
- Mentor approval interface.
- Staff approval interface.
- User account management.
- Role assignment.
- Access profile management.
- Account activation, suspension, and deactivation.
- User permission override management where required for MVP operations.

#### **Shared Staff Operations**

- Permission-aware navigation and actions.
- Role-specific dashboard content.
- Operational status indicators.
- Search, filtering, and pagination for administrative data.
- Audit information for sensitive administrative actions where available.

### **Deliverable**

Complete operational administration for CEO, COO, CMO, and Superadmin.

---

## **Phase 7 — MVP Hardening**

### **Scope**

#### **Functional Validation**

- Verify complete flows for:
  - Mentee registration and authentication.
  - Mentor registration and approval.
  - Staff registration and approval.
  - Account activation and access control.
  - Research Content lifecycle.
  - Webinar lifecycle.
  - Bootcamp lifecycle.
  - Enrollment key lifecycle.
  - Mentee bootcamp enrollment.
  - Bootcamp session and resource access.
  - Staff operational workflows.

#### **Authorization Review**

- Audit route and action permissions.
- Verify access profiles.
- Verify role-to-access-profile mappings.
- Verify ownership-based access restrictions.
- Verify Superadmin access.
- Verify pending, suspended, and disabled account restrictions.
- Verify permission overrides where implemented.

#### **Data Integrity**

- Validate database constraints.
- Validate lifecycle state transitions.
- Verify duplicate enrollment prevention.
- Verify enrollment key expiration and usage rules.
- Verify publication state consistency.
- Verify account approval consistency.

#### **Security**

- Input validation review.
- Authentication and session review.
- Rate limiting.
- Security headers.
- Sensitive data exposure review.
- File upload validation where applicable.
- External URL validation.
- Production-safe error responses.

#### **Frontend Quality**

- Responsive review.
- Accessibility review.
- Loading-state review.
- Empty-state review.
- Error-state review.
- Permission-denied state review.
- Visual consistency with `style-guide.md`.
- Cross-browser verification.

#### **Engineering Quality**

- Type checking.
- Linting.
- Formatting.
- Build verification.
- Critical automated test review.
- Migration validation.
- Logging review.
- Audit logging verification.
- Remove unused code and temporary development artifacts.
- Documentation synchronization where required.

#### **API Documentation**

- OpenAPI specification for REST API.
- Swagger UI for development/internal API exploration.
- Document authentication requirements.
- Document request/response schemas.
- Document major error responses.
- Document public vs protected endpoints.
- Keep API documentation synchronized with implemented routes.

### **Deliverable**

MVP Release Candidate with verified core functionality, security, authorization, data integrity, and frontend quality.

---

## **Phase 8 — MVP Deployment**

### **Scope**

- Prepare production environment variables.
- Provision production PostgreSQL database.
- Apply production Prisma migrations.
- Configure production file storage.
- Deploy Next.js frontend.
- Deploy Express backend.
- Configure Better Auth production settings.
- Configure application URLs and CORS.
- Configure production domain and DNS.
- Configure HTTPS.
- Configure deployment secrets.
- Configure logging and basic production monitoring.
- Verify database backup capability.
- Perform production smoke testing.
- Verify:
  - authentication,
  - account approval,
  - authorization,
  - Research Content,
  - Webinar,
  - Bootcamp,
  - enrollment,
  - staff operations.

- Verify `/health`.
- Verify `/ready`.
- Perform final production sanity check after deployment.

Initial MVP deployment may use:

```text
Frontend → Vercel
Backend  → Vercel
Database → Supabase PostgreSQL
Storage  → Supabase Storage
```

These providers remain deployment choices rather than application architecture dependencies.

### **Deliverable**

ResearchGap MVP deployed and operational in the production environment.

# **11\. Post-MVP Direction**

Post-MVP features akan ditentukan berdasarkan penggunaan platform dan kebutuhan actual ResearchGap.

Candidate features:

- Structured mentee–mentor mentoring.
- Mentor discovery.
- Co-author research collaboration.
- Research project workspace.
- Notifications.
- Email notification.
- Certificates.
- Native assessment system.
- Recommendation engine.
- AI-assisted research discovery.
- Analytics expansion.
- Dynamic permission management.
- Audit logging.
- Separate worker/service architecture.
- gRPC for internal service communication if required.
- Mobile application.

#

# **12\. MVP Completion Definition**

ResearchGap dapat dianggap mencapai MVP ketika:

1. Mentee dapat register dan menggunakan platform.

2. Mentor dan staff memiliki approval workflow.

3. Role CEO, COO, CMO, dan Superadmin memiliki access yang berbeda.

4. Bootcamp dapat dibuat, dipublikasikan, dan diikuti melalui enrollment key.

5. Bootcamp dapat memiliki sessions dan resources.

6. Webinar dapat dipublikasikan sebagai external event information.

7. Research content dapat dibuat dan dipublikasikan.

8. Staff dapat menjalankan fungsi sesuai role masing-masing.

9. Core user flow telah diuji.

10. Application berhasil di-deploy pada production environment.
