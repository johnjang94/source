/*
  Warnings:

  - A unique constraint covering the columns `[projectId,applicantId]` on the table `ChatRoom` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_projectId_applicantId_key" ON "ChatRoom"("projectId", "applicantId");
