/*
  Warnings:

  - You are about to drop the column `location` on the `Profile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SexualOrientation" AS ENUM ('HETEROSEXUAL', 'HOMOSEXUAL', 'BISEXUAL', 'ASEXUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "LookingFor" AS ENUM ('LONG_TERM_PARTNER', 'LONG_TERM_OPEN_TO_SHORT', 'SHORT_TERM_OPEN_TO_LONG', 'SHORT_TERM_FUN', 'NEW_FRIENDS', 'STILL_FIGURING_IT_OUT');

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "location",
ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "lookingFor" "LookingFor" NOT NULL DEFAULT 'NEW_FRIENDS',
ADD COLUMN     "sexualOrientation" "SexualOrientation" NOT NULL DEFAULT 'HETEROSEXUAL',
ALTER COLUMN "interestedIn" SET DEFAULT 'MALE';
