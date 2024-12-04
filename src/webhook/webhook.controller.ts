import { Body, Controller, Post, Req } from '@nestjs/common';
import { addDays } from 'date-fns';
import { PaymentService } from 'src/payments/payment.service';
import { PrismaService } from 'src/prisma.service';

@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly paymentService: PaymentService,
        private readonly prisma: PrismaService
    ){}

    @Post('momo')
    async handlePaymentNotification(@Body() notification: { transactionId: string, status: string }) {
        console.log(notification);
        const { transactionId, status } = notification;
      
        if (status === 'SUCCESSFUL') {
            // 1. Mettre à jour le paiement
            await this.paymentService.updatePaymentStatus(transactionId, 'SUCCESSFUL');
        
            // 2. Activer la souscription
            const userId = await this.paymentService.getUserIdByTransactionId(transactionId);

            const expiresAt = addDays(new Date(), 30);
            await this.prisma.subscription.update({
                where: { userId },
                data: {
                expiresAt,
                active: true
                },
            });
        
            return { message: 'Subscription activated successfully' };
        } else {
            await this.paymentService.updatePaymentStatus(transactionId, 'FAILED');
            return { message: 'Payment failed' };
        }
    } 
}
