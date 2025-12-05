/*
  Warnings:

  - Added the required column `updatedAt` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlayerTurn" AS ENUM ('PLAYER1', 'PLAYER2');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "boardState" TEXT NOT NULL DEFAULT '_________',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentTurn" "PlayerTurn" NOT NULL DEFAULT 'PLAYER1',
ADD COLUMN     "moves" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "password" TEXT;
