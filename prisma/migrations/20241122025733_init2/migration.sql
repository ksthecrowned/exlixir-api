/*
  Warnings:

  - Changed the type of `interestedIn` on the `Profile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "InterestedIn" AS ENUM ('MALE', 'FEMALE', 'BOTH');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "interestedIn",
ADD COLUMN     "interestedIn" "InterestedIn" NOT NULL;

-- CreateTable
CREATE TABLE "VerificationTokensOnUser" (
    "userId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationTokensOnUser_userId_tokenId_key" ON "VerificationTokensOnUser"("userId", "tokenId");

-- AddForeignKey
ALTER TABLE "VerificationTokensOnUser" ADD CONSTRAINT "VerificationTokensOnUser_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "VerificationToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationTokensOnUser" ADD CONSTRAINT "VerificationTokensOnUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
