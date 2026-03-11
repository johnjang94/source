-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'INTERVIEW', 'SELECTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProjectApplication" ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED';

-- CreateTable
CREATE TABLE "ApplicationForm" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "resumeR2Key" TEXT NOT NULL,
    "portfolioLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationForm_applicationId_key" ON "ApplicationForm"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationForm_applicationId_idx" ON "ApplicationForm"("applicationId");

-- AddForeignKey
ALTER TABLE "ApplicationForm" ADD CONSTRAINT "ApplicationForm_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ProjectApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
