-- DropForeignKey
ALTER TABLE "shapes" DROP CONSTRAINT "shapes_createdBy_fkey";

-- AlterTable
ALTER TABLE "shapes" ALTER COLUMN "createdBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "shapes" ADD CONSTRAINT "shapes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
