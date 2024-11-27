import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaService } from "src/prisma.service";
import { SendGridService } from "src/sendgrid.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, SendGridService],
})
export class AuthModule {}
