-- AlterEnum
ALTER TYPE "MatriculaStatus" ADD VALUE 'AGUARDANDO';

-- AlterTable
ALTER TABLE "matriculas" ALTER COLUMN "status" SET DEFAULT 'AGUARDANDO';
