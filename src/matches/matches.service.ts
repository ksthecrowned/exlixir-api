import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CreateMatchDto } from "./dto/create-match.dto";
import { logger } from "utils/logger";

@Injectable()
export class MatchesSerice {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async create(data: CreateMatchDto) {
        try {
            const prevMatch = await this.prisma.match.findFirst({
                where: {
                    user1Id: data.user1Id,
                    user2Id: data.user2Id
                }
            })

            if(prevMatch) {
                return {
                    statusCode: 200,
                    match: prevMatch,
                    isMatch: true,
                    message: "It's a Match!"
                }
            }

            const match = await this.prisma.match.create({
                data
            })
            return {
                statusCode: 200,
                match,
                isMatch: true,  
                message: "It's a Match!",
            }
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async findAllUserMatches(userId: string) {
        try {
            const matches = await this.prisma.match.findMany({
                where: {
                    OR: [
                        {user1Id: userId},
                        {user2Id: userId}
                    ]
                },
                include: {
                    messages: true,
                    user1: {
                        include: {
                            profile: true
                        }
                    },
                    user2: {
                        include: {
                            profile: true
                        }
                    }
                }
            })

            return {
                statusCode: 200,
                matches: matches.map(match => {
                    if (match.user1Id === userId) {
                        delete match.user1;
                    } else {
                        delete match.user2;
                    }
                    return match;
                }),
                message: "Matches retrieved successfully!"
            }
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async findOneUserMatch(id: string, userId: string) {
        try {
            const match = await this.prisma.match.findUnique({
                where: {
                    id,
                    OR: [
                        {user1Id: userId},
                        {user2Id: userId}
                    ]
                },
                include: {
                    messages: true,
                    user1: true,
                    user2: true
                }
            })
            return {
                statusCode: 200,
                match,
                message: "Match retrieved successfully!"
            }
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }
}