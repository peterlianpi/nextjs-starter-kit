/*
  Warnings:

  - Added the required column `lastRequest` to the `rate_limit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rate_limit" ADD COLUMN     "lastRequest" BIGINT NOT NULL;
