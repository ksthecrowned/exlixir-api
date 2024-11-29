import { BadRequestException, Body, Controller, Get, Post, Req, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { MatchesSerice } from "./matches.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { validate } from "class-validator";
import { CreateMatchDto } from "./dto/create-match.dto";
import { PrismaService } from "src/prisma.service";

@ApiTags('Matches')
@Controller("matches")
export class MatchesController {
    constructor(
        private readonly matchesService: MatchesSerice,
        private readonly prisma: PrismaService
    ) {}

    @Post('')
    @UsePipes(new ValidationPipe())
    async create(
        @Body() data: CreateMatchDto,
        @Res() res: FastifyReply,
        @Req() req: FastifyRequest,
    ) {
        try {
            const errors = await validate(data);
            if (errors.length > 0) {
                throw new BadRequestException(errors);
            }
            const response = await this.matchesService.create(data);
            return res.status(response.statusCode).send(response);
        } catch (error) {
            return res.status(500).send('Internal server error');
        }
    }

    @Get('')
    async getAllMatches(@Res() res: FastifyReply, @Req() req: FastifyRequest) {
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

            const response = await this.matchesService.findAllUserMatches(tokenIsValid.userId);
            return res.status(response.statusCode).send(response);    
        } catch (error) {
            return res.status(500).send('Internal server error');
        }
    }
}