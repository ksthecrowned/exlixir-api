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
        private readonly messagesService: MessagesService
    ) {}

    @Post("")
    async sendMessage(
        @Res() res: FastifyReply,
        @Req() req: FastifyRequest,
        @Body() data: SendMessageDto
    ) {
        try {
            const errors = await validate(data);
            if (errors.length > 0) {
                throw new BadRequestException(errors);
            }
            const response = await this.messagesService.send(data);
            return res.status(response.statusCode).send(response);
        } catch (error) {
            return res.status(500).send('Internal server error');
        }
    }

    @Get("/:senderId/:matchId")
    async getChatHistory(
        @Res() res: FastifyReply,
        @Req() req: FastifyRequest,
        @Param() data: { senderId: string, matchId: string }
    ) {
        try {
            const response = await this.messagesService.getChatHistory(data.senderId, data.matchId);
            return res.status(response.statusCode).send(response);
        } catch (error) {
            return res.status(500).send('Internal server error');
        }
    }
}