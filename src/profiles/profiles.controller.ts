import { ProfilesService } from "./profiles.service";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { ApiTags } from "@nestjs/swagger";
import { FastifyReply, FastifyRequest } from "fastify";
import { validate } from "class-validator";
import { PrismaService } from "src/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@ApiTags("Profiles")
@Controller("profiles")
@UseGuards(AuthGuard)
export class ProfilesController {
    constructor(
        private readonly profilesService: ProfilesService,
        private readonly prisma: PrismaService
    ){}

    @Post("")
    async create(
        @Body() data: Omit<CreateProfileDto, "userId">,
        @Req() req: FastifyRequest,
        @Res() res: FastifyReply
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

            const errors = await validate({ ...data, userId: tokenIsValid.userId });
            if (errors.length > 0) {
                throw new BadRequestException(errors);
            }
            const response = await this.profilesService.create({ ...data, userId: tokenIsValid.userId });
            return res.status(response.statusCode).send(response);
        } catch (error) {
            return res.status(500).send({
                statusCode: 500,
                message: "Internal server error",
            })
        }
    }

    @Get("")
    async getAllProfiles(
        @Req() req: FastifyRequest, 
        @Res() res: FastifyReply
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

            const response = await this.profilesService.findAll();
            return res.status(response.statusCode).send(response);
        } catch (error) {
            return res.status(500).send({
                statusCode: 500,
                message: "Internal server error",
            })
        }
    }

    @Get('/:userId')
    async getOneProfile(
        @Req() req: FastifyRequest, 
        @Res() res: FastifyReply,
        @Param('userId') userId: string
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

            const response = await this.profilesService.findOne(userId);
            return res.status(response.statusCode).send(response);
        } catch (error) {
            return res.status(500).send({
                statusCode: 500,
                message: "Internal server error",
            })
        }
    }

    @Patch('/:userId')
    async updateProfile(
        @Req() req: FastifyRequest, 
        @Res() res: FastifyReply,
        @Param('userId') userId: string,
        @Body() data: UpdateProfileDto
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

            const response = await this.profilesService.update({ ...data, userId: tokenIsValid.userId });
            return res.status(response.statusCode).send(response);
        } catch (error) {
            return res.status(500).send({
                statusCode: 500,
                message: "Internal server error",
            })
        }
    }

    @Delete('/:userId')
    async deleteProfile(
        @Req() req: FastifyRequest, 
        @Res() res: FastifyReply,
        @Param('userId') userId: string
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

            const response = await this.profilesService.delete(userId);
            return res.status(response.statusCode).send(response);
        } catch (error) {
            console.log(error)
            return res.status(500).send({
                statusCode: 500,
                message: "Internal server error",
            })
        }
    }
}