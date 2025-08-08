/*
  Warnings:

  - The primary key for the `File` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `aiTags` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `contentType` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `isFolder` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `parentFolderId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `s3_key` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `File` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileName]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bucket` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_parentFolderId_fkey";

-- DropIndex
DROP INDEX "public"."File_s3_key_key";

-- AlterTable
ALTER TABLE "public"."File" DROP CONSTRAINT "File_pkey",
DROP COLUMN "aiTags",
DROP COLUMN "contentType",
DROP COLUMN "filename",
DROP COLUMN "isFolder",
DROP COLUMN "ownerId",
DROP COLUMN "parentFolderId",
DROP COLUMN "s3_key",
DROP COLUMN "updatedAt",
ADD COLUMN     "bucket" TEXT NOT NULL,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "size" DROP DEFAULT,
ADD CONSTRAINT "File_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "File_id_seq";

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "password",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "public"."Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "public"."Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "public"."Authenticator"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "File_fileName_key" ON "public"."File"("fileName");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
