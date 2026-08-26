-- CreateEnum
CREATE TYPE "webinar_session_type" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "webinar_status" AS ENUM ('DRAFT', 'PUBLISHED', 'COMPLETED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "webinars" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "speaker_name" TEXT,
    "scheduled_at" TIMESTAMPTZ(3) NOT NULL,
    "session_type" "webinar_session_type" NOT NULL,
    "venue" TEXT,
    "registration_url" TEXT,
    "meeting_url" TEXT,
    "cover_asset_id" TEXT,
    "status" "webinar_status" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" TEXT NOT NULL,
    "published_by_id" TEXT,
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "webinars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webinars_slug_key" ON "webinars"("slug");

-- CreateIndex
CREATE INDEX "webinars_created_by_id_created_at_id_idx" ON "webinars"("created_by_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "webinars_published_by_id_idx" ON "webinars"("published_by_id");

-- CreateIndex
CREATE INDEX "webinars_cover_asset_id_idx" ON "webinars"("cover_asset_id");

-- CreateIndex
CREATE INDEX "webinars_status_scheduled_at_id_idx" ON "webinars"("status", "scheduled_at", "id");

-- CreateIndex
CREATE INDEX "webinars_status_created_at_id_idx" ON "webinars"("status", "created_at", "id");

-- AddForeignKey
ALTER TABLE "webinars" ADD CONSTRAINT "webinars_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webinars" ADD CONSTRAINT "webinars_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webinars" ADD CONSTRAINT "webinars_cover_asset_id_fkey" FOREIGN KEY ("cover_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
