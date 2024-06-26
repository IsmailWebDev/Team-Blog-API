/*
  Warnings:

  - You are about to drop the `DeletedPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "DeletedPost";
