import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import { PrismaService } from "src/prisma.service";
import { RedisService } from "src/redis.service";
import { SubscriptionService } from "src/subscriptions/subscriptions.service";

@Module({
    controllers: [MessagesController],
    providers: [MessagesService, PrismaService, RedisService, SubscriptionService],
    exports: []
})
export class MessagesModule {}