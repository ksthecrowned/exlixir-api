-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "expiresAt" DROP NOT NULL;
