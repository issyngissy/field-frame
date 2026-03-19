-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "inducted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "induction_date" TIMESTAMP(3);
