-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectIntake" (
    "id" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "timeInvestment" TEXT NOT NULL,
    "budgetRange" TEXT NOT NULL,
    "projectDescription" TEXT NOT NULL,
    "goals" TEXT NOT NULL,
    "mp4Url" TEXT,
    "thumbnailUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectIntake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectIntake_clientUserId_createdAt_idx" ON "ProjectIntake"("clientUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProjectIntake" ADD CONSTRAINT "ProjectIntake_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
