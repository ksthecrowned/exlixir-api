import { Injectable } from '@nestjs/common';
import { addDays } from 'date-fns';
import { MomoService } from 'src/momo/momo.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly momoService: MomoService
  ) {}

  async createOrUpdateSubscription(
    userId: string,
    type: 'PREMIUM' | 'PREMIUM_PLUS',
    phoneNumber: string,
    amount: number,
    currency: string = 'XAF',
  ) {
    try {
      // Étape 1 : Initier une demande de paiement via MomoService
      const paymentResponse = await this.momoService.requestPayment(amount, currency, phoneNumber);
  
      if (paymentResponse.status !== 202) {
        throw new Error('Payment initiation failed');
      }
  
      const transactionId = paymentResponse.transactionId;
  
      // Étape 2 : Enregistrer le paiement dans la table "Payment"
      const payment = await this.prisma.payment.create({
        data: {
          userId,
          transactionId,
          amount,
          currency,
          status: 'PENDING',
          paymentMethod: 'MOMO',
        },
      });
  
      // Étape 5 : Créer ou mettre à jour l'abonnement
      const subscription = await this.prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          type,
          active: false
        },
        update: {
          type,
          active: false
        },
      });
  
      return {
        statusCode: 200,
        message: 'Subscription updated successfully',
        subscription,
        payment
      };
    } catch (error) {
      throw error;
    }
  }  

  async activateSubscription(userId: string, durationInDays: number) {
    const expiresAt = addDays(new Date(), durationInDays);
  
    return await this.prisma.subscription.update({
      where: { userId },
      data: {
        expiresAt,
        active: true
      },
    });
  }
  

  async checkSubscriptionStatus(userId: string) {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });
  
      if (!subscription) {
        return { isActive: false, type: null };
      }
  
      const isActive = new Date(subscription.expiresAt) > new Date();
  
      return { 
        statusCode: 200,
        isActive, 
        type: subscription.type 
      }
    } catch (error) {
      throw error;
    }
  }
}
