import { Injectable } from "@nestjs/common";
import { Payment } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class PaymentService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async createPayment(userId: string, amount: number, transactionId: string, paymentMethod: string): Promise<Payment> {
        try {
            return await this.prisma.payment.create({
                data: {
                    userId,
                    amount,
                    currency: 'XAF',
                    status: 'PENDING',
                    transactionId,
                    paymentMethod,
                },
            });
        } catch (error) {
            throw error;
        }
    }
      

    async updatePaymentStatus(transactionId: string, status: 'SUCCESSFUL' | 'FAILED') {
        try {
            return await this.prisma.payment.updateMany({
                where: { transactionId },
                data: { status },
              });
        } catch (error) {
            throw error;
        }
    }     
    
    async getUserIdByTransactionId(transactionId: string) {
        try {
            const payment = await this.prisma.payment.findFirst({ where: { transactionId } });
            return payment.userId;
        } catch (error) {
            throw error;
        }
    }
}