import { BadRequestException, Body, Controller, Post, Req, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { MatchesSerice } from "./matches.service";
import { MakeSwipeDto } from "src/swipes/dto/make-swipe.dto";
import { FastifyReply, FastifyRequest } from "fastify";
import { validate } from "class-validator";
import { CreateMatchDto } from "./dto/create-match.dto";

@ApiTags('Matches')
@Controller("matches")
export class MatchesController {
    constructor(private readonly MatchesService: MatchesSerice) {}

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
            const response = await this.MatchesService.create(data);
            return res.status(response.statusCode).send(response);
        } catch (error) {
            return res.status(500).send('Internal server error');
        }
    }
}