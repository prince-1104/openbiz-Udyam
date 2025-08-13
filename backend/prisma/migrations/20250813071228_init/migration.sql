/*
  Warnings:

  - You are about to alter the column `aadhaar` on the `Registration` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(12)`.
  - You are about to alter the column `pan` on the `Registration` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - Added the required column `aadhaar_name` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aadhaar_otp` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organisation_name` to the `Registration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Registration" ADD COLUMN     "aadhaar_name" TEXT NOT NULL,
ADD COLUMN     "aadhaar_otp" VARCHAR(6) NOT NULL,
ADD COLUMN     "organisation_name" TEXT NOT NULL,
ALTER COLUMN "aadhaar" SET DATA TYPE VARCHAR(12),
ALTER COLUMN "pan" SET DATA TYPE VARCHAR(10);
