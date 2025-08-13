-- AlterTable
ALTER TABLE "public"."Registration" ALTER COLUMN "aadhaar" DROP NOT NULL,
ALTER COLUMN "pan" DROP NOT NULL,
ALTER COLUMN "aadhaar_name" DROP NOT NULL,
ALTER COLUMN "aadhaar_otp" DROP NOT NULL,
ALTER COLUMN "organisation_name" DROP NOT NULL;
