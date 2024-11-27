import { Module } from "@nestjs/common";
import { ProfilesService } from "./profiles.service";
import { PrismaService } from "src/prisma.service";
import { ProfilesController } from "./profiles.controller";

@Module({
    controllers: [ProfilesController],
    providers: [ProfilesService, PrismaService],
})
export class ProfilesModule {}