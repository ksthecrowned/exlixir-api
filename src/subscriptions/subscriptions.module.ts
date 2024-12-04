import { Module } from "@nestjs/common";
import { SubscriptionService } from "./subscriptions.service";
import { SubscriptionsController } from "./subscriptions.controller";
import { PrismaService } from "src/prisma.service";
import { MomoService } from "src/momo/momo.service";

@Module({
    controllers: [SubscriptionsController],
    providers: [SubscriptionService, PrismaService, MomoService],
    exports: []
})
export class SubscriptionsModule {}