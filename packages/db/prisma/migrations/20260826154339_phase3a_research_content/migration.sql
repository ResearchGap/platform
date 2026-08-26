-- CreateEnum
CREATE TYPE "media_source_type" AS ENUM ('MANAGED', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "research_content_type" AS ENUM ('NEWS', 'ARTICLE', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "research_content_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "created_by_id" TEXT,
    "source_type" "media_source_type" NOT NULL,
    "storage_key" TEXT,
    "external_url" TEXT,
    "original_name" TEXT,
    "mime_type" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "content_type" "research_content_type" NOT NULL,
    "cover_asset_id" TEXT,
    "status" "research_content_status" NOT NULL DEFAULT 'DRAFT',
    "author_id" TEXT NOT NULL,
    "published_by_id" TEXT,
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "research_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_assets_created_by_id_idx" ON "media_assets"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "research_content_slug_key" ON "research_content"("slug");

-- CreateIndex
CREATE INDEX "research_content_author_id_created_at_id_idx" ON "research_content"("author_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "research_content_published_by_id_idx" ON "research_content"("published_by_id");

-- CreateIndex
CREATE INDEX "research_content_cover_asset_id_idx" ON "research_content"("cover_asset_id");

-- CreateIndex
CREATE INDEX "research_content_status_published_at_id_idx" ON "research_content"("status", "published_at", "id");

-- CreateIndex
CREATE INDEX "research_content_status_created_at_id_idx" ON "research_content"("status", "created_at", "id");

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_content" ADD CONSTRAINT "research_content_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_content" ADD CONSTRAINT "research_content_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_content" ADD CONSTRAINT "research_content_cover_asset_id_fkey" FOREIGN KEY ("cover_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
