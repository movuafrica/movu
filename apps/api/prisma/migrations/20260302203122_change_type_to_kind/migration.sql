/*
  Warnings:

  - You are about to drop the column `type` on the `Account` table. All the data in the column will be lost.
  - Added the required column `kind` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountKind" AS ENUM ('PERSONAL', 'BUSINESS');

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "type",
ADD COLUMN     "kind" "AccountKind" NOT NULL;
