-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarPath" TEXT,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "role" TEXT;
