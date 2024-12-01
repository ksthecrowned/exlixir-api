import { Body, Controller, Post, Req } from '@nestjs/common';
import { PaymentService } from 'src/payments/payment.service';
import { SubscriptionService } from 'src/subscriptions/subscriptions.service';

@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly paymentService: PaymentService,
        private readonly subscriptionService: SubscriptionService
    ){}

    @Post('momo')
    async handlePaymentNotification(@Body() notification: { transactionId: string, status: string }) {
        const { transactionId, status } = notification;
      
        if (status === 'SUCCESSFUL') {
            // 1. Mettre à jour le paiement
            await this.paymentService.updatePaymentStatus(transactionId, 'SUCCESSFUL');
        
            // 2. Activer la souscription
            const userId = await this.paymentService.getUserIdByTransactionId(transactionId);
            await this.subscriptionService.activateSubscription(userId, 30);
        
            return { message: 'Subscription activated successfully' };
        } else {
            await this.paymentService.updatePaymentStatus(transactionId, 'FAILED');
            return { message: 'Payment failed' };
        }
    } 
}
