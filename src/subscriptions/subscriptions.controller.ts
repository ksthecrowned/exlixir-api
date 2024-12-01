import { BadRequestException, Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { SubscriptionService } from "./subscriptions.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateOrUpdateSubscriptionDto } from "./dto/create-or-update-subscription.dto";
import { validate } from "class-validator";
import { PrismaService } from "src/prisma.service";

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(AuthGuard)
export class SubscriptionsController {

    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly prisma: PrismaService
    ) {}

    @Post("")
    async createOrUpdateSubscription(
        @Res() res: FastifyReply,
        @Req() req: FastifyRequest,
        @Body() data: CreateOrUpdateSubscriptionDto
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

            const errors = await validate(data);
            if (errors.length > 0) {
                throw new BadRequestException(errors);
            }
            const response = await this.subscriptionService.createOrUpdateSubscription(tokenIsValid.userId, data.durationInDays, data.type);
            return res.status(response.statusCode).send(response);
        } catch (error) {
            return res.status(500).send('Internal server error');
        }
    }

    @Get("/check-status")
    async verifySubscription(
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

            const response = await this.subscriptionService.checkSubscriptionStatus(tokenIsValid.userId);   
            return res.status(response.statusCode).send(response);
        } catch (error) {
            return res.status(500).send('Internal server error');
        }
    }
}