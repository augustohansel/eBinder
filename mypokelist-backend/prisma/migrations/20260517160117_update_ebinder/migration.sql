/*
  Warnings:

  - You are about to drop the column `cardBack` on the `Collection` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_userId_fkey";

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "cardBack" TEXT NOT NULL DEFAULT 'pokemon';

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "cardBack",
ADD COLUMN     "cols" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "rows" INTEGER NOT NULL DEFAULT 3,
ALTER COLUMN "icon" DROP DEFAULT,
ALTER COLUMN "accent" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
