-- CreateEnum
CREATE TYPE "bootcamp_status" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "bootcamp_session_type" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateTable
CREATE TABLE "bootcamps" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "what_you_get" TEXT,
    "start_date" TIMESTAMPTZ(3) NOT NULL,
    "end_date" TIMESTAMPTZ(3) NOT NULL,
    "registration_deadline" TIMESTAMPTZ(3),
    "cover_asset_id" TEXT,
    "status" "bootcamp_status" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" TEXT NOT NULL,
    "published_by_id" TEXT,
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bootcamps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamp_sessions" (
    "id" TEXT NOT NULL,
    "bootcamp_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "speaker_name" TEXT,
    "scheduled_at" TIMESTAMPTZ(3) NOT NULL,
    "session_type" "bootcamp_session_type" NOT NULL,
    "venue" TEXT,
    "module_url" TEXT,
    "pre_test_url" TEXT,
    "post_test_url" TEXT,
    "feedback_url" TEXT,
    "recording_url" TEXT,
    "cover_asset_id" TEXT,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bootcamp_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bootcamps_slug_key" ON "bootcamps"("slug");

-- CreateIndex
CREATE INDEX "bootcamps_created_by_id_created_at_id_idx" ON "bootcamps"("created_by_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "bootcamps_published_by_id_idx" ON "bootcamps"("published_by_id");

-- CreateIndex
CREATE INDEX "bootcamps_cover_asset_id_idx" ON "bootcamps"("cover_asset_id");

-- CreateIndex
CREATE INDEX "bootcamps_status_start_date_id_idx" ON "bootcamps"("status", "start_date", "id");

-- CreateIndex
CREATE INDEX "bootcamps_status_end_date_id_idx" ON "bootcamps"("status", "end_date", "id");

-- CreateIndex
CREATE INDEX "bootcamp_sessions_bootcamp_id_scheduled_at_id_idx" ON "bootcamp_sessions"("bootcamp_id", "scheduled_at", "id");

-- CreateIndex
CREATE INDEX "bootcamp_sessions_cover_asset_id_idx" ON "bootcamp_sessions"("cover_asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "bootcamp_sessions_bootcamp_id_sort_order_key" ON "bootcamp_sessions"("bootcamp_id", "sort_order");

-- AddForeignKey
ALTER TABLE "bootcamps" ADD CONSTRAINT "bootcamps_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamps" ADD CONSTRAINT "bootcamps_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamps" ADD CONSTRAINT "bootcamps_cover_asset_id_fkey" FOREIGN KEY ("cover_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_sessions" ADD CONSTRAINT "bootcamp_sessions_bootcamp_id_fkey" FOREIGN KEY ("bootcamp_id") REFERENCES "bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_sessions" ADD CONSTRAINT "bootcamp_sessions_cover_asset_id_fkey" FOREIGN KEY ("cover_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
