import { Injectable } from '@nestjs/common';
import { addDays } from 'date-fns';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateSubscription(userId: string, durationInDays: number, type: 'PREMIUM' | 'PREMIUM_PLUS') {
    try {
      const expiresAt = addDays(new Date(), durationInDays);

      const subscription = await this.prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          type,
          expiresAt,
        },
        update: {
          type,
          expiresAt,
        },
      });

      return {
        statusCode: 200,
        message: 'Subscription updated successfully',
        subscription,
      };
    } catch (error) {
      throw error;
    }
  }

  async activateSubscription(userId: string, durationInDays: number) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + durationInDays);
  
    return await this.prisma.subscription.update({
      where: { userId },
      data: {
        expiresAt: expirationDate,
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
