import { Module } from "@nestjs/common";
import { SubscriptionService } from "./subscriptions.service";
import { SubscriptionsController } from "./subscriptions.controller";
import { PrismaService } from "src/prisma.service";

@Module({
    controllers: [SubscriptionsController],
    providers: [SubscriptionService, PrismaService],
    exports: []
})
export class SubscriptionsModule {}