import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SwipesService } from './swipes.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { MakeSwipeDto } from './dto/make-swipe.dto';
import { validate } from 'class-validator';
import { MatchesSerice } from 'src/matches/matches.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrismaService } from 'src/prisma.service';

@ApiTags('Swipes')
@Controller('swipes')
@UseGuards(AuthGuard)
export class SwipesController {
    constructor(
        private readonly SwipesService: SwipesService, 
        private readonly MatchesSerice: MatchesSerice,
        private readonly prisma: PrismaService
    ) {}

    @ApiBody({
        description: 'Make a swipe',
        schema: {
            required: ['fromUserId', 'toUserId', 'isLike'],
            properties: {
                fromUserId: { type: 'string', example: 'jobg-5ebg-....-vbiu-78ji', description: 'The user who swiped' }, 
                toUserId: { type: 'string', example: 'jobg-5ebg-....-vbiu-78ji', description: 'The user who was swiped' }, 
                isLike: { type: 'boolean' },
            },
        }
    })
    @Post('')
    @UsePipes(new ValidationPipe())
    /**
     * Make a swipe on a user
     * @param data The data to make the swipe
     * @param res The response object
     * @param req The request object
     * @returns The response of the swipe
     * @throws If there was an error making the swipe
     */
    async makeSwipe(
        @Body() data: MakeSwipeDto,
        @Res() res: FastifyReply,
        @Req() req: FastifyRequest,
    ) {
        const token = req.headers['authorization'].replace('Bearer ', '');
        try {
            // check if token is valid
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

            // check if fromUser exists
            const fromUser = await this.prisma.user.findUnique({
                where: {
                    id: data.fromUserId,
                }
            })
            if(!fromUser || !fromUser.isVerified) {
                return res.status(404).send("The user who swiped doesn't exist or isn't verified");
            }

            // check if toUser exists
            const toUser = await this.prisma.user.findUnique({
                where: {
                    id: data.toUserId,
                }
            })
            if(!toUser || !toUser.isVerified) {
                return res.status(404).send("You're trying to swipe someone that doesn't exist or isn't verified");
            }
            
            const errors = await validate(data);
            if (errors.length > 0) {
                throw new BadRequestException(errors);
            }
            const response = await this.SwipesService.makeSwipe(data);
            if(response.isMatch) {
                const resp = await this.MatchesSerice.create({
                    user1Id: response.swipe.fromUserId,
                    user2Id: response.swipe.toUserId,
                })
                return res.status(resp.statusCode).send(resp);
            }
            return res.status(response.statusCode).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send('Internal server error');
        }
    }

    @Get("/likes")
    /**
     * Retrieves all the users who have liked the user with the given ID.
     * @param userId - The ID of the user whose likes we want to retrieve.
     * @returns An object containing the retrieved users, a status code, and a success message.
     * @throws If there was an error retrieving the users.
     */
    async findAllUserLikes(
        @Res() res: FastifyReply,
        @Req() req: FastifyRequest,
        @Query("received") received: string
    ) {
        const token = req.headers['authorization'].replace('Bearer ', '');
        const userId = (req as any).userId;
        
        try {
            // check if token is valid
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

            // check if user exists
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId as string,
                }
            })
            if(!user || !user.isVerified) {
                return res.status(404).send("The user doesn't exist or isn't verified");
            }

            const response = await this.SwipesService.findAllUserLikes(userId as string, received === 'true')
            return res.status(response.statusCode).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send('Internal server error');
        }
    }
}