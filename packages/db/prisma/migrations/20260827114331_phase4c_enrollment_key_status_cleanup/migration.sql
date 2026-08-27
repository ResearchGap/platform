BEGIN;

-- Preserve capability overrides while replacing the scope-like permission name.
UPDATE "user_permission_overrides"
SET "permission_key" = 'bootcamp.learning.access'
WHERE "permission_key" = 'enrollment.read-own';

-- Preserve the effective EXPIRED state before removing it from persisted status.
UPDATE "enrollment_keys"
SET
    "status" = 'ACTIVE',
    "expires_at" = CASE
        WHEN "expires_at" IS NULL OR "expires_at" > CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP
        ELSE "expires_at"
    END
WHERE "status" = 'EXPIRED';

ALTER TYPE "enrollment_key_status" RENAME TO "enrollment_key_status_old";
CREATE TYPE "enrollment_key_status" AS ENUM ('ACTIVE', 'INACTIVE');

ALTER TABLE "enrollment_keys" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "enrollment_keys"
    ALTER COLUMN "status" TYPE "enrollment_key_status"
    USING ("status"::text::"enrollment_key_status");
ALTER TABLE "enrollment_keys" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

DROP TYPE "enrollment_key_status_old";

COMMIT;
