-- CreateEnum
CREATE TYPE "role_code" AS ENUM ('MENTEE', 'MENTOR', 'CEO', 'COO', 'CMO', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "access_profile_code" AS ENUM ('MENTEE_DEFAULT', 'MENTOR_DEFAULT', 'EXECUTIVE_READ', 'OPERATIONS_FULL', 'MARKETING_FULL', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "account_status" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "approval_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "permission_effect" AS ENUM ('ALLOW', 'DENY');

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nickname" TEXT,
    "whatsapp" TEXT,
    "institution" TEXT,
    "research_field" TEXT,
    "biography" TEXT,
    "expertise" TEXT,
    "affiliation" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_access" (
    "user_id" TEXT NOT NULL,
    "role_code" "role_code" NOT NULL,
    "access_profile_code" "access_profile_code" NOT NULL,
    "account_status" "account_status" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_access_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "account_approvals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "requested_role_code" "role_code" NOT NULL,
    "status" "approval_status" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMPTZ(3),
    "review_note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "account_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permission_overrides" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permission_key" TEXT NOT NULL,
    "effect" "permission_effect" NOT NULL,
    "reason" TEXT,
    "expires_at" TIMESTAMPTZ(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_permission_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_approvals_user_id_key" ON "account_approvals"("user_id");

-- CreateIndex
CREATE INDEX "account_approvals_reviewed_by_id_idx" ON "account_approvals"("reviewed_by_id");

-- CreateIndex
CREATE INDEX "user_permission_overrides_created_by_id_idx" ON "user_permission_overrides"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_permission_overrides_user_id_permission_key_key" ON "user_permission_overrides"("user_id", "permission_key");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_access" ADD CONSTRAINT "user_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_approvals" ADD CONSTRAINT "account_approvals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_approvals" ADD CONSTRAINT "account_approvals_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission_overrides" ADD CONSTRAINT "user_permission_overrides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission_overrides" ADD CONSTRAINT "user_permission_overrides_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
