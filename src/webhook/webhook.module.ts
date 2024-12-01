import { Module } from "@nestjs/common";
import { PaymentService } from "src/payments/payment.service";
import { PrismaService } from "src/prisma.service";
import { SubscriptionService } from "src/subscriptions/subscriptions.service";

@Module({
    controllers: [],
    providers: [PaymentService, SubscriptionService, PrismaService],
    exports: []
})
export class WebhookModule {}