import { Controller, Get, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FeedService } from "./feed.service";
import { FastifyReply } from "fastify";

@ApiTags('Feed')
@Controller('feed')
export class FeedController {
    constructor(
        private readonly feedService: FeedService
    ) {}

    @Get("")
    async getFeed(
        @Res() res: FastifyReply
    ) {
        try {
            const response = await this.feedService.findAllUsers();
            return res.status(response.statusCode).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send('Internal server error');
        }
    }
}