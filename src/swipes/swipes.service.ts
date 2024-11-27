import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { MakeSwipeDto } from "./dto/make-swipe.dto";
import { logger } from "utils/logger";

@Injectable()
export class SwipesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async makeSwipe(data: MakeSwipeDto) {
    try {
      const prevSwipe = await this.prisma.swipe.findFirst({
        where: {
          fromUserId: data.fromUserId,
          toUserId: data.toUserId
        }
      })

      if(prevSwipe) {
        return {
          statusCode: 409,
          message: "Swipe already exists!"
        }
      }

      const swipe = await this.prisma.swipe.create({
        data: {
          isLike: data.isLike,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          createdAt: new Date()
        }
      })

      const isMatch = await this.prisma.swipe.findFirst({
        where: {
          fromUserId: data.toUserId,
          toUserId: data.fromUserId,
          isLike: true
        }
      })

      return {
        statusCode: 201,
        swipe,
        isMatch: isMatch,
        message: "Swipe done successfully!"
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async findAllUserLikes(userId: string, received: boolean) {
    try {
      const likes = await this.prisma.swipe.findMany({
        where: {
          ...(received ? 
            {toUserId: userId} 
            : {fromUserId: userId}
          ),
          isLike: true
        },
        include: {
          fromUser: {
            select: {
              id: true,
              email: true,
              isVerified: true,
              profile: true,
            }
          },
          toUser: {
            select: {
              id: true,
              email: true,
              isVerified: true,
              profile: true,
            }
          }
        }
      })

      return {
        statusCode: 200,
        likes,
        message: "User likes retrieved successfully!"
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}