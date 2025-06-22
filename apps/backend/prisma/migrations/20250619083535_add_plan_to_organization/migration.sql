/*
  Warnings:

  - You are about to drop the `_ParticipantScores` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('free', 'elite');

-- DropForeignKey
ALTER TABLE "_ParticipantScores" DROP CONSTRAINT "_ParticipantScores_A_fkey";

-- DropForeignKey
ALTER TABLE "_ParticipantScores" DROP CONSTRAINT "_ParticipantScores_B_fkey";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'free';

-- DropTable
DROP TABLE "_ParticipantScores";

-- CreateTable
CREATE TABLE "ParticipantScore" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "answers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParticipantScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantScore_participantId_assessmentId_key" ON "ParticipantScore"("participantId", "assessmentId");

-- AddForeignKey
ALTER TABLE "ParticipantScore" ADD CONSTRAINT "ParticipantScore_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantScore" ADD CONSTRAINT "ParticipantScore_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
