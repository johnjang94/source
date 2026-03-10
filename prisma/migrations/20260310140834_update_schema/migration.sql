/*
  Warnings:

  - You are about to drop the column `budgetRange` on the `ProjectIntake` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `ProjectIntake` table. All the data in the column will be lost.
  - You are about to drop the column `goals` on the `ProjectIntake` table. All the data in the column will be lost.
  - You are about to drop the column `timeInvestment` on the `ProjectIntake` table. All the data in the column will be lost.
  - Added the required column `budgetAllowance` to the `ProjectIntake` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expectedOutcome` to the `ProjectIntake` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectDeadline` to the `ProjectIntake` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProjectIntake" DROP CONSTRAINT "ProjectIntake_clientUserId_fkey";

-- AlterTable
ALTER TABLE "ProjectIntake" DROP COLUMN "budgetRange",
DROP COLUMN "email",
DROP COLUMN "goals",
DROP COLUMN "timeInvestment",
ADD COLUMN     "budgetAllowance" TEXT NOT NULL,
ADD COLUMN     "expectedOutcome" TEXT NOT NULL,
ADD COLUMN     "projectDeadline" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'submitted',
ADD COLUMN     "submissionType" TEXT NOT NULL DEFAULT 'guided',
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "registeredNumber" TEXT,
    "serviceDescription" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "projectDescription" TEXT NOT NULL,
    "expectedOutcome" TEXT NOT NULL,
    "budgetAllowance" TEXT NOT NULL,
    "projectDeadline" TIMESTAMP(3) NOT NULL,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "submissionType" TEXT NOT NULL DEFAULT 'guided',
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectApplication" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_userId_key" ON "Company"("userId");

-- CreateIndex
CREATE INDEX "Company_userId_idx" ON "Company"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_intakeId_key" ON "Project"("intakeId");

-- CreateIndex
CREATE INDEX "Project_clientUserId_idx" ON "Project"("clientUserId");

-- CreateIndex
CREATE INDEX "ProjectApplication_projectId_idx" ON "ProjectApplication"("projectId");

-- CreateIndex
CREATE INDEX "ProjectApplication_userId_idx" ON "ProjectApplication"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectApplication_projectId_userId_key" ON "ProjectApplication"("projectId", "userId");

-- CreateIndex
CREATE INDEX "ProjectIntake_clientUserId_idx" ON "ProjectIntake"("clientUserId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectIntake" ADD CONSTRAINT "ProjectIntake_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "ProjectIntake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectApplication" ADD CONSTRAINT "ProjectApplication_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectApplication" ADD CONSTRAINT "ProjectApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
