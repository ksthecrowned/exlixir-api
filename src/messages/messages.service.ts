import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { RedisService } from "src/redis.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { SubscriptionService } from "src/subscriptions/subscriptions.service";

@Injectable()
export class MessagesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
        private readonly subscriptionService: SubscriptionService
    ) {}

    async sendMessage(data: SendMessageDto) {
        try {
          const subscription = await this.subscriptionService.checkSubscriptionStatus(data.senderId);
      
          let matchId: string | null = null;
          if (!subscription.isActive) {
            const match = await this.prisma.match.findFirst({
              where: {
                OR: [
                  { user1Id: data.senderId, user2Id: data.recipientId },
                  { user1Id: data.recipientId, user2Id: data.senderId },
                ],
              },
            });
      
            if (!match) {
              throw new ForbiddenException('Vous devez avoir un match ou être premium pour envoyer un message.');
            }
      
            matchId = match.id;
          }
      
          const message = await this.prisma.message.create({
            data: {
              senderId: data.senderId,
              recipientId: data.recipientId,
              content: data.content,
              matchId,
            },
          });
      
          const redisKey = matchId
            ? `chat:${matchId}`
            : `chat:${data.senderId}:${data.recipientId}`;
      
          await this.redisService.set(redisKey, JSON.stringify(message));
      
          return {
            statusCode: 200,
            msg: message,
            message: 'Message sent successfully',
          };
        } catch (error) {
          throw error;
        }
    }
    
    async getAllConversations(userId: string) {
        try {
          const redisKey = `user:${userId}:conversations`;
      
          // Vérifier si les conversations sont en cache
          const cachedConversations = await this.redisService.get(redisKey);
      
          if (cachedConversations) {
            return {
              statusCode: 200,
              conversations: JSON.parse(cachedConversations),
              message: 'Conversations fetched successfully (from cache)',
            };
          }
      
          // Rechercher les conversations dans la base de données
          const conversations = await this.prisma.message.findMany({
            where: {
              OR: [
                { senderId: userId }, // Messages envoyés par l'utilisateur
                { recipientId: userId }, // Messages reçus par l'utilisateur
              ],
            },
            select: {
              matchId: true,
              senderId: true,
              recipientId: true,
              content: true,
              sentAt: true,
              sender: {
                select: { profile: true }, // Inclure les infos du profil de l'expéditeur
              },
              match: {
                select: { user1Id: true, user2Id: true }, // Inclure les infos du match si applicable
              },
            },
            orderBy: { sentAt: 'desc' }, // Trier par date décroissante
          });
      
          // Grouper les messages par conversation
          const groupedConversations = conversations.reduce((acc, message) => {
            const conversationId = message.matchId || 
              [message.senderId, message.recipientId].sort().join(':');
            
            if (!acc[conversationId]) {
              acc[conversationId] = [];
            }
      
            acc[conversationId].push(message);
            return acc;
          }, {});
      
          // Mettre en cache les conversations pour les futures requêtes
          await this.redisService.set(redisKey, JSON.stringify(groupedConversations));
      
          return {
            statusCode: 200,
            conversations: groupedConversations,
            message: 'Conversations fetched successfully (from database)',
          };
        } catch (error) {
          throw error;
        }
    } 

    async getConversation(senderId: string, recipientId: string) {
        try {
          const redisKey = `conversation:${[senderId, recipientId].sort().join(':')}`;
      
          // Vérifier si la conversation est en cache
          const cachedConversation = await this.redisService.get(redisKey);
      
          if (cachedConversation) {
            return {
              statusCode: 200,
              conversation: JSON.parse(cachedConversation),
              message: 'Conversation fetched successfully (from cache)',
            };
          }
      
          // Récupérer la conversation depuis la base de données si elle n'est pas en cache
          const conversation = await this.prisma.message.findMany({
            where: {
              OR: [
                { senderId, recipientId },
                { senderId: recipientId, recipientId: senderId },
              ],
            },
            orderBy: { sentAt: 'asc' }, // Trier par ordre croissant de la date
          });
      
          // Mettre en cache la conversation pour de futures requêtes
          await this.redisService.set(redisKey, JSON.stringify(conversation));
      
          return {
            statusCode: 200,
            conversation,
            message: 'Conversation fetched successfully (from database)',
          };
        } catch (error) {
          console.error('Error fetching conversation:', error);
          throw error;
        }
    }      
}