export class CreateOrUpdateSubscriptionDto {
    userId: string;
    type: 'PREMIUM' | 'PREMIUM_PLUS';
    phoneNumber: string
    amount: number;
    currency: string; 
}