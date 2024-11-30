import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import { PrismaService } from "src/prisma.service";
import { RedisService } from "src/redis.service";

@Module({
    controllers: [MessagesController],
    providers: [MessagesService, PrismaService, RedisService],
    exports: []
})
export class MessagesModule {}