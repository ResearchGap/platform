-- CreateEnum
CREATE TYPE "password_reset_source" AS ENUM ('SELF_SERVICE', 'SUPPORT');

-- CreateEnum
CREATE TYPE "password_reset_delivery_mode" AS ENUM ('EMAIL', 'MANUAL');

-- CreateEnum
CREATE TYPE "password_reset_status" AS ENUM ('REQUESTED', 'NO_ACCOUNT', 'EMAIL_SENT', 'DELIVERY_FAILED', 'MANUAL_READY', 'COMPLETED');

-- CreateTable
CREATE TABLE "password_reset_requests" (
    "id" TEXT NOT NULL,
    "requested_email" TEXT NOT NULL,
    "user_id" TEXT,
    "source" "password_reset_source" NOT NULL,
    "delivery_mode" "password_reset_delivery_mode" NOT NULL,
    "status" "password_reset_status" NOT NULL DEFAULT 'REQUESTED',
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3),
    "email_sent_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "reset_url_encrypted" TEXT,
    "manually_revealed_at" TIMESTAMPTZ(3),
    "manually_revealed_by_id" TEXT,
    "requested_by_id" TEXT,
    "safe_delivery_error" TEXT,

    CONSTRAINT "password_reset_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_reset_requests_requested_email_idx" ON "password_reset_requests"("requested_email");

-- CreateIndex
CREATE INDEX "password_reset_requests_user_id_idx" ON "password_reset_requests"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_requests_requested_at_idx" ON "password_reset_requests"("requested_at");

-- CreateIndex
CREATE INDEX "password_reset_requests_status_idx" ON "password_reset_requests"("status");

-- CreateIndex
CREATE INDEX "password_reset_requests_ip_address_requested_at_idx" ON "password_reset_requests"("ip_address", "requested_at");

-- CreateIndex
CREATE INDEX "password_reset_requests_user_id_requested_at_idx" ON "password_reset_requests"("user_id", "requested_at");

-- CreateIndex
CREATE INDEX "password_reset_requests_manually_revealed_by_id_idx" ON "password_reset_requests"("manually_revealed_by_id");

-- CreateIndex
CREATE INDEX "password_reset_requests_requested_by_id_idx" ON "password_reset_requests"("requested_by_id");

-- AddForeignKey
ALTER TABLE "password_reset_requests" ADD CONSTRAINT "password_reset_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_requests" ADD CONSTRAINT "password_reset_requests_manually_revealed_by_id_fkey" FOREIGN KEY ("manually_revealed_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_requests" ADD CONSTRAINT "password_reset_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
