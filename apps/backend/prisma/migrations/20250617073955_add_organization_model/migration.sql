/*
  Warnings:

  - You are about to drop the column `orgName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `orgSize` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `orgType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "orgName",
DROP COLUMN "orgSize",
DROP COLUMN "orgType",
ADD COLUMN     "orgId" TEXT;

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
