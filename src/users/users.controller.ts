import {
  Controller,
  Body,
  Patch,
  Delete,
  Res,
  Req,
  Get,
  Param,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  UseGuards,
  Post,
} from "@nestjs/common";
import { UserService } from "./users.service";
import {
  UpdateUserProfileDto,
  UpdateUserPasswordDto,
} from "./dto/update-user.dto";
import { FastifyReply, FastifyRequest } from "fastify";
import { logger } from "utils/logger";
import { ApiTags } from "@nestjs/swagger";
import { validate } from "class-validator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "src/prisma.service";

@ApiTags("Users")
@Controller("users")
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createUser(
    @Res() res: FastifyReply,
    @Req() req: FastifyRequest,
    @Body() createUserDto: CreateUserDto
  ) {
    try {
      const errors = await validate(createUserDto);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }
      const response = await this.userService.createUser(createUserDto);
      return res.status(response.statusCode).send(response);
    } catch (error) {
      return res.status(500).send({
        statusCode: 500,
        message: "Internal server error",
      });
    }
  }
  
  @Get()
  async getAllUsers(@Res() res: FastifyReply, @Req() req: FastifyRequest) {
    try {
      const response = await this.userService.getAllUSers();
      return res.status(response.statusCode).send(response);
    } catch (error) {
      logger.error({
        date: new Date().toLocaleString(),
        from: req.ip,
        error,
      });
      return res.status(500).send({
        statusCode: 500,
        message: "Internal server error",
      });
    }
  }

  @Get(":id")
  async getOneUser(
    @Res() res: FastifyReply,
    @Req() req: FastifyRequest,
    @Param("id") id: string
  ) {
    try {
      const response = await this.userService.getOneUser(id);
      return res.status(response.statusCode).send(response);
    } catch (error) {
      if (error.code === "P2025") {
        // P2025 is the Prisma error code for record not found
        // It will be triggered if the post with the corresponding id and authorId do not exist
        return res.status(404).send({
          statusCode: 404,
          message: "The user you are trying to retrieve does not exist.",
        });
      } else {
        logger.error({
          date: new Date().toLocaleString(),
          from: req.ip,
          error,
        });
        return res.status(500).send({
          statusCode: 500,
          message: "Internal server error",
        });
      }
    }
  }

  @Patch("update-password/:id")
  @UsePipes(new ValidationPipe())
  async updatePassword(
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
    @Res() res: FastifyReply,
    @Param("id") id: string,
    @Req() req: FastifyRequest
  ) {
    try {
      const errors = await validate(updateUserPasswordDto);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }
      const response = await this.userService.updatePassword(
        id,
        updateUserPasswordDto
      );
      return res.status(response.statusCode).send(response);
    } catch (error) {
      if (error.code === "P2025") {
        // P2025 is the Prisma error code for record not found
        // It will be triggered if the post with the corresponding id and authorId do not exist
        return res.status(404).send({
          statusCode: 404,
          message: "The user you are trying to update does not exist.",
        });
      } else {
        logger.error({
          date: new Date().toLocaleString(),
          from: req.ip,
          error,
        });
        return res.status(500).send({
          statusCode: 500,
          message: "Internal server error",
        });
      }
    }
  }

  @Delete("id")
  async deleteAccount(
    @Res() res: FastifyReply,
    @Req() req: FastifyRequest,
    @Param("id") id: string
  ) {
    try {
      const response = await this.userService.delete(id);
      return res.status(response.statusCode).send(response);
    } catch (error) {
      if (error.code === "P2025") {
        // P2025 is the Prisma error code for record not found
        // It will be triggered if the post with the corresponding id and authorId do not exist
        return res.status(404).send({
          statusCode: 404,
          message: "The user you are trying to delete does not exist.",
        });
      } else {
        logger.error({
          date: new Date().toLocaleString(),
          from: req.ip,
          error,
        });
        return res.status(500).send({
          statusCode: 500,
          message: "Internal server error",
        });
      }
    }
  }
}
