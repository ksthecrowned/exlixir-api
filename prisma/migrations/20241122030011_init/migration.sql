/*
  Warnings:

  - You are about to drop the `VerificationTokensOnUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VerificationTokensOnUser" DROP CONSTRAINT "VerificationTokensOnUser_tokenId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationTokensOnUser" DROP CONSTRAINT "VerificationTokensOnUser_userId_fkey";

-- DropTable
DROP TABLE "VerificationTokensOnUser";
