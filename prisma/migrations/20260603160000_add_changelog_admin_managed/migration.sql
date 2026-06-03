-- AlterTable
ALTER TABLE "Changelog" ADD COLUMN     "adminManaged" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: every entry that exists before this feature was created or edited
-- through the admin UI, so mark them all admin-managed to protect them from
-- being overwritten by the file sync. New rows default to false (file-managed)
-- and the write paths set the flag explicitly.
UPDATE "Changelog" SET "adminManaged" = true;
