/*
  Warnings:

  - You are about to drop the column `mp4Url` on the `ProjectIntake` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ProjectIntake` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `ProjectIntake` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProjectIntake" DROP CONSTRAINT "ProjectIntake_clientUserId_fkey";

-- DropIndex
DROP INDEX "ProjectIntake_clientUserId_createdAt_idx";

-- AlterTable
ALTER TABLE "ProjectIntake" DROP COLUMN "mp4Url",
DROP COLUMN "status",
DROP COLUMN "thumbnailUrl",
ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
DROP COLUMN "updatedAt",
ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ProjectIntake" ADD CONSTRAINT "ProjectIntake_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
