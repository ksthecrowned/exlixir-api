import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import fetch from 'node-fetch';
import { randomUUID } from 'node:crypto';

@Injectable()
export class MomoService implements OnModuleInit, OnModuleDestroy {
  private bearerToken: string | null = null;
  private apiKey: string | null = null;
  private userReferenceId: string | null = null;
  private subscriptionKey: string | null = null;
  private apiBaseUrl: string | null = null;

  constructor(
    // private readonly apiBaseUrl = process.env.MOMO_API_URL || '',
    // private readonly subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY || '',
    // private readonly userReferenceId = process.env.MOMO_USER_REFERENCE_ID || '',
  ) {}

  async onModuleInit() {
    this.apiBaseUrl = process.env.MOMO_API_URL || '',
    this.subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY || '',
    this.userReferenceId = process.env.MOMO_USER_REFERENCE_ID || '',
    console.log('Initializing MoMo Service...');
    try {
      // Create API user and generate API key if necessary
      await this.createApiUser();
      const apiKeyResponse = await this.generateApiKey();
      this.apiKey = apiKeyResponse.apiKey;

      // Generate Bearer Token
      const tokenResponse = await this.generateAuthToken();
      const tokenData = await tokenResponse.json();
      this.bearerToken = tokenData.access_token;

      console.log('Bearer token initialized:', this.bearerToken);
    } catch (error) {
      console.error('Error initializing MoMo Service:', error);
    }
  }

  async onModuleDestroy() {
    this.bearerToken = null;
    console.log('MoMo Service shut down.');
  }

  async createApiUser(): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/v1_0/apiuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'X-Reference-Id': this.userReferenceId,
        },
        body: JSON.stringify({
          providerCallbackHost: process.env.MOMO_CALLBACK_URL || 'http://localhost:4000/webhook/momo',
        }),
      });

      if(response.status === 409) {
        console.log('API user already exists');
      }
      return response;
    } catch (error) {
      console.error('Error creating API user:', error);
      throw error;
    }
  }

  async generateApiKey(): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/v1_0/apiuser/${this.userReferenceId}/apikey`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          },
        },
      );
      return response.json();
    } catch (error) {
      console.error('Error generating API key:', error);
      throw error;
    }
  }

  async generateAuthToken(): Promise<any> {
    try {
      const credentials = Buffer.from(
        `${this.userReferenceId}:${this.apiKey}`,
      ).toString('base64');
      const response = await fetch(`${this.apiBaseUrl}/collection/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        },
      });
      return response;
    } catch (error) {
      console.error('Error generating auth token:', error);
      throw error;
    }
  }

  async requestPayment(amount: number, currency: string, phoneNumber: string): Promise<any> {
    if (!this.bearerToken) {
      throw new Error('Bearer token not initialized. Please authenticate first.');
    }

    try {
      const externalId = randomUUID();
      const response = await fetch(`${this.apiBaseUrl}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Target-Environment': 'sandbox',
          'X-Reference-Id': externalId,
          Authorization: `Bearer ${this.bearerToken}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency,
          externalId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: phoneNumber,
          },
          payerMessage: 'Payment for subscription',
          payeeNote: 'Thank you for your payment',
        }),
      });
      return {
        transactionId: externalId,
        status: response.status
      }
    } catch (error) {
      console.error('Error requesting payment:', error);
      throw error;
    }
  }

  async getPaymentStatus(transactionId: string): Promise<any> {
    if (!this.bearerToken) {
      throw new Error('Bearer token not initialized. Please authenticate first.');
    }

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/collection/v1_0/requesttopay/${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Target-Environment': 'sandbox',
            Authorization: `Bearer ${this.bearerToken}`,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          },
        },
      );
      return response.json();
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }
}