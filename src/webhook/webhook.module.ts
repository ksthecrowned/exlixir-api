import { Module } from "@nestjs/common";
import { PaymentService } from "src/payments/payment.service";
import { PrismaService } from "src/prisma.service";
import { WebhookController } from "./webhook.controller";

@Module({
    controllers: [WebhookController],
    providers: [PaymentService, PrismaService],
    exports: []
})
export class WebhookModule {}