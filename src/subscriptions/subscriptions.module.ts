import { Module } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { SubscriptionsController } from "./subscriptions.controller";
import { PrismaService } from "src/prisma.service";

@Module({
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService, PrismaService],
    exports: []
})
export class SubscriptionsModule {}