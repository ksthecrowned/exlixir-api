import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class FeedService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async findAllUsers() {
        try {
            const users = await this.prisma.user.findMany({
                where: {
                    profile: {
                        isNot: null
                    }
                },
                select: {
                    id: true,
                    email: true,
                    isVerified: true,
                    isAdmin: true,
                    profile: true
                },
            });
            return {
                statusCode: 200,
                users,
                message: "Users retrieved successfully",
            };
        } catch (error) {
            throw error;
        }
    }
}