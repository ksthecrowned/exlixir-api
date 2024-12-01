export class CreateOrUpdateSubscriptionDto {
    userId: string;
    durationInDays: number;
    type: 'PREMIUM' | 'PREMIUM_PLUS';
}