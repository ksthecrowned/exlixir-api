import { Module } from "@nestjs/common";
import { UserService } from "./users.service";
import { UsersController } from "./users.controller";
import { PrismaService } from "src/prisma.service";
import { SendGridService } from "src/sendgrid.service";

/**
 * Module for managing user-related functionality.
 */
@Module({
  controllers: [UsersController],
  providers: [UserService, PrismaService, SendGridService],
})
export class UsersModule {}
