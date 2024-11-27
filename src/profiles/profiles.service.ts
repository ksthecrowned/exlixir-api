import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class ProfilesService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async create(data: CreateProfileDto) {
        try {
            const profile = await this.prisma.profile.create({
                data: {
                    ...data,
                    photos: data.photos
                    ? {
                        createMany: {
                            data: data.photos.map((photo) => ({
                            ...photo,
                            })),
                        },
                        }
                    : undefined,
                }
            })

            return {
                statusCode: 200,
                profile,
                message: "Profile created successfully"
            }
        } catch (error) {
            throw error
        }
    }

    async update(data: UpdateProfileDto) {
        try {
            const profile = await this.prisma.profile.update({
                where: {
                    userId: data.userId
                },
                data: {
                    ...data,
                    photos: data.photos
                    ? {
                        createMany: {
                            data: data.photos.map((photo) => ({
                            ...photo,
                            })),
                        },
                        }
                    : undefined,
                }
            })

            return {
                statusCode: 200,
                profile,
                message: "Profile updated successfully"
            }
        } catch (error) {
            throw error
        }
    }

    async findOne (userId: string) {
        try {
            const profile = await this.prisma.profile.findFirst({
                where: {
                    userId,
                },
            })
            
            return {
                statusCode: 200,
                profile,
                message: "Profile retrieved successfully",
            };
        } catch (error) {
            throw error;
        }
    }

    async delete (userId: string) {
        try {
            const profile = await this.prisma.profile.delete({
                where: {
                    userId,
                },
            });
            return {
                statusCode: 200,
                profile,
                message: "Profile deleted successfully",
            };
        } catch (error) {
            throw error;
        }
    }

    async findAll() {
        try {
            const profiles = await this.prisma.profile.findMany();
            return {
                statusCode: 200,
                profiles,
                message: "Profiles retrieved successfully",
            };
        } catch (error) {
            throw error;
        }
    }
}