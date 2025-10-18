/*
  Warnings:

  - A unique constraint covering the columns `[email,username,displayUsername]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."user_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "user_email_username_displayUsername_key" ON "user"("email", "username", "displayUsername");
