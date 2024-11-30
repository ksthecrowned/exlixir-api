import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { RedisService } from "src/redis.service";
import { SendMessageDto } from "./dto/send-message.dto";

@Injectable()
export class MessagesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService
    ) {}

    async send(data: SendMessageDto) {
        try {
            const message = await this.prisma.message.create({ data });
    
            // Cache the message in Redis for real-time functionality
            const redisKey = `chat:${data.senderId}:${data.matchId}`;
            await this.redisService.set(redisKey, JSON.stringify(message));
        
            return {
                statusCode: 200,
                msg: message,
                message: "Message sent successfully"
            }
        } catch (error) {
            throw error;   
        }
    }
    
    async getChatHistory(senderId: string, matchId: string) {
        try {
            const redisKey = `chat:${senderId}:${matchId}`;
    
            // Try to get cached messages from Redis
            const cachedMessage = await this.redisService.get(redisKey);
        
            if (cachedMessage) {
                return {
                    statusCode: 200,
                    messages: JSON.parse(cachedMessage),
                    message: "Messages fetched successfully"
                }
            }
        
            // Fallback to database if no cache is found
            const messages = await this.prisma.message.findMany({
                where: { senderId, matchId },
                orderBy: { sentAt: 'asc' },
            });
        
            // Cache messages for future requests
            await this.redisService.set(redisKey, JSON.stringify(messages));
        
            return {
                statusCode: 200,
                messages,
                message: "Messages fetched successfully"
            }
        } catch (error) {
            throw error;
        }
    }
}