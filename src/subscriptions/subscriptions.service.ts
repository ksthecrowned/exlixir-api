import { Injectable } from '@nestjs/common';
import { addDays } from 'date-fns';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateSubscription(userId: string, durationInDays: number, type: 'PREMIUM' | 'PREMIUM_PLUS') {
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

    return subscription;
  }

  async checkSubscriptionStatus(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return { isActive: false, type: null };
    }

    const isActive = new Date(subscription.expiresAt) > new Date();

    return { isActive, type: subscription.type };
  }
}
