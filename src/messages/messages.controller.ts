import { PrismaService } from "src/prisma.service";
import { MessagesService } from "./messages.service";
import { BadRequestException, Body, Controller, Get, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { FastifyReply, FastifyRequest } from "fastify";
import { SendMessageDto } from "./dto/send-message.dto";
import { validate } from "class-validator";

@ApiTags('Messages')
@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService,
        private readonly prisma: PrismaService
    ) {}

    @Post("")
    async sendMessage(
        @Res() res: FastifyReply,
        @Body() data: SendMessageDto
    ) {
        try {
            const errors = await validate(data);
            if (errors.length > 0) {
                throw new BadRequestException(errors);
            }
            const response = await this.messagesService.sendMessage(data);
            return res.status(response.statusCode).send(response);
        } catch (error) {
            return res.status(500).send('Internal server error');
        }
    }

    @Get("")
    async getChatHistory(
        @Res() res: FastifyReply,
        @Req() req: FastifyRequest,
    ) {
        try {
            const token = req.headers['authorization'].replace('Bearer ', '');
            const tokenIsValid = await this.prisma.verificationToken.findFirst({
                where: {
                    token,
                    expiresAt: {
                        gt: new Date(),
                    }
                }
            })
            if(!tokenIsValid || !tokenIsValid.userId) {
                return res.status(401).send('Unauthorized');
            }

            const userExists = await this.prisma.user.findUnique({
                where: {
                    id: tokenIsValid.userId,
                    isVerified: true
                }
            })

            if(!userExists) {
                return res.status(400).send({
                    statusCode: 400,
                    message: "User not found or not verified"
                })
            }
            
            const response = await this.messagesService.getAllConversations(tokenIsValid.userId);
            return res.status(response.statusCode).send(response);
        } catch (error) {
            return res.status(500).send('Internal server error');
        }
    }

    @Get("/:senderId/:receiverId")
    async getConversation(
        @Res() res: FastifyReply,
        @Req() req: FastifyRequest,
        @Param('senderId') senderId: string,
        @Param('receiverId') receiverId: string
    ) {
        try {
            const response = await this.messagesService.getConversation(senderId, receiverId);
            return res.status(response.statusCode).send(response);
        } catch (error) {
            return res.status(500).send('Internal server error');
        }
    }
}