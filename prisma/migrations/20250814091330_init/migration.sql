/*
  Warnings:

  - You are about to drop the column `detail` on the `todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `todo` DROP COLUMN `detail`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `otpExpiry` DATETIME(3) NULL;
