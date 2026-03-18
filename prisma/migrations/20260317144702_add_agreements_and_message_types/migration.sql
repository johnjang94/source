-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'text';

-- CreateTable
CREATE TABLE "SignedAgreement" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agreementType" TEXT NOT NULL,
    "signatureData" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignedAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SignedAgreement_projectId_idx" ON "SignedAgreement"("projectId");

-- CreateIndex
CREATE INDEX "SignedAgreement_userId_idx" ON "SignedAgreement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SignedAgreement_projectId_userId_agreementType_key" ON "SignedAgreement"("projectId", "userId", "agreementType");

-- AddForeignKey
ALTER TABLE "SignedAgreement" ADD CONSTRAINT "SignedAgreement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
