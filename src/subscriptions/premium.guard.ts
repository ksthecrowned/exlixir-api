import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const subscription = await this.subscriptionService.checkSubscriptionStatus(userId);

    if (!subscription.isActive) {
      throw new UnauthorizedException('Vous devez avoir un abonnement actif pour accéder à cette fonctionnalité.');
    }

    return true;
  }
}
