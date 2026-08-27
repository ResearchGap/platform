-- CreateEnum
CREATE TYPE "enrollment_key_audience" AS ENUM ('MENTEE', 'MENTOR');

-- CreateEnum
CREATE TYPE "enrollment_key_status" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "bootcamp_enrollment_status" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "bootcamp_mentor_assignment_source" AS ENUM ('CREATOR', 'SELF_ENROLLED', 'STAFF_ASSIGNED');

-- CreateEnum
CREATE TYPE "bootcamp_mentor_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "enrollment_keys" (
    "id" TEXT NOT NULL,
    "bootcamp_id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "key_hint" TEXT,
    "audience" "enrollment_key_audience" NOT NULL,
    "status" "enrollment_key_status" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMPTZ(3),
    "max_uses" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_keys_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "enrollment_keys_max_uses_check" CHECK ("max_uses" IS NULL OR "max_uses" > 0),
    CONSTRAINT "enrollment_keys_usage_count_check" CHECK ("usage_count" >= 0),
    CONSTRAINT "enrollment_keys_usage_limit_check" CHECK ("max_uses" IS NULL OR "usage_count" <= "max_uses")
);

-- CreateTable
CREATE TABLE "bootcamp_enrollments" (
    "id" TEXT NOT NULL,
    "bootcamp_id" TEXT NOT NULL,
    "mentee_id" TEXT NOT NULL,
    "enrollment_key_id" TEXT NOT NULL,
    "status" "bootcamp_enrollment_status" NOT NULL DEFAULT 'ACTIVE',
    "enrolled_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bootcamp_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamp_mentors" (
    "id" TEXT NOT NULL,
    "bootcamp_id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "assignment_source" "bootcamp_mentor_assignment_source" NOT NULL,
    "enrollment_key_id" TEXT,
    "assigned_by_id" TEXT,
    "status" "bootcamp_mentor_status" NOT NULL DEFAULT 'ACTIVE',
    "assigned_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bootcamp_mentors_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "bootcamp_mentors_assignment_source_check" CHECK (
        ("assignment_source" = 'CREATOR' AND "enrollment_key_id" IS NULL AND "assigned_by_id" IS NULL)
        OR ("assignment_source" = 'SELF_ENROLLED' AND "enrollment_key_id" IS NOT NULL AND "assigned_by_id" IS NULL)
        OR ("assignment_source" = 'STAFF_ASSIGNED' AND "enrollment_key_id" IS NULL AND "assigned_by_id" IS NOT NULL)
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_keys_code_hash_key" ON "enrollment_keys"("code_hash");

-- CreateIndex
CREATE INDEX "enrollment_keys_bootcamp_id_audience_status_created_at_id_idx" ON "enrollment_keys"("bootcamp_id", "audience", "status", "created_at", "id");

-- CreateIndex
CREATE INDEX "enrollment_keys_created_by_id_idx" ON "enrollment_keys"("created_by_id");

-- CreateIndex
CREATE INDEX "bootcamp_enrollments_mentee_id_status_enrolled_at_id_idx" ON "bootcamp_enrollments"("mentee_id", "status", "enrolled_at", "id");

-- CreateIndex
CREATE INDEX "bootcamp_enrollments_bootcamp_id_status_enrolled_at_id_idx" ON "bootcamp_enrollments"("bootcamp_id", "status", "enrolled_at", "id");

-- CreateIndex
CREATE INDEX "bootcamp_enrollments_enrollment_key_id_idx" ON "bootcamp_enrollments"("enrollment_key_id");

-- CreateIndex
CREATE UNIQUE INDEX "bootcamp_enrollments_bootcamp_id_mentee_id_key" ON "bootcamp_enrollments"("bootcamp_id", "mentee_id");

-- CreateIndex
CREATE INDEX "bootcamp_mentors_mentor_id_status_assigned_at_id_idx" ON "bootcamp_mentors"("mentor_id", "status", "assigned_at", "id");

-- CreateIndex
CREATE INDEX "bootcamp_mentors_bootcamp_id_status_assigned_at_id_idx" ON "bootcamp_mentors"("bootcamp_id", "status", "assigned_at", "id");

-- CreateIndex
CREATE INDEX "bootcamp_mentors_enrollment_key_id_idx" ON "bootcamp_mentors"("enrollment_key_id");

-- CreateIndex
CREATE INDEX "bootcamp_mentors_assigned_by_id_idx" ON "bootcamp_mentors"("assigned_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "bootcamp_mentors_bootcamp_id_mentor_id_key" ON "bootcamp_mentors"("bootcamp_id", "mentor_id");

-- AddForeignKey
ALTER TABLE "enrollment_keys" ADD CONSTRAINT "enrollment_keys_bootcamp_id_fkey" FOREIGN KEY ("bootcamp_id") REFERENCES "bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_keys" ADD CONSTRAINT "enrollment_keys_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_enrollments" ADD CONSTRAINT "bootcamp_enrollments_bootcamp_id_fkey" FOREIGN KEY ("bootcamp_id") REFERENCES "bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_enrollments" ADD CONSTRAINT "bootcamp_enrollments_mentee_id_fkey" FOREIGN KEY ("mentee_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_enrollments" ADD CONSTRAINT "bootcamp_enrollments_enrollment_key_id_fkey" FOREIGN KEY ("enrollment_key_id") REFERENCES "enrollment_keys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_mentors" ADD CONSTRAINT "bootcamp_mentors_bootcamp_id_fkey" FOREIGN KEY ("bootcamp_id") REFERENCES "bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_mentors" ADD CONSTRAINT "bootcamp_mentors_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_mentors" ADD CONSTRAINT "bootcamp_mentors_enrollment_key_id_fkey" FOREIGN KEY ("enrollment_key_id") REFERENCES "enrollment_keys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_mentors" ADD CONSTRAINT "bootcamp_mentors_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
