import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import {
  UpdateUserPasswordDto,
  UpdateUserProfileDto,
} from "./dto/update-user.dto";
import { comparePassword, hashPassword, haversineDistance, purgeUser } from "utils/utils";
import { logger } from "utils/logger";
import { CreateUserDto } from "./dto/create-user.dto";
import { SendGridService } from "src/sendgrid.service";
import { Gender, LookingFor, SexualOrientation } from "@prisma/client";

/**
 * Service responsible for handling user-related operations.
 */
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sendGrid: SendGridService
  ) {}

  /**
   * Retrieves a single user by their ID.
   * @param id - The ID of the user to retrieve.
   * @returns An object containing the retrieved user, along with a status code and message.
   * @throws If an error occurs while retrieving the user.
   */
  async getOneUser(id: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id,
        },
      })
      const profile = await this.prisma.profile.findFirst({
        where: {
          userId: id
        }
      })
      return {
        statusCode: 200,
        user: {
          ...purgeUser(user),
          profile: profile
        },
        message: "User retrieved successfully",
      };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async getAllUsers(
    userId: string,
    radiusInKm: number,
    gender?: Gender,
    age?: string,
    sexualOrientation?: SexualOrientation,
    lookingFor?: LookingFor,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { profile: { select: { latitude: true, longitude: true } } },
      });
  
      const userLatitude = user?.profile?.latitude;
      const userLongitude = user?.profile?.longitude;
  
      if (!userLatitude || !userLongitude) {
        return {
          statusCode: 400,
          users: [],
          message: "User location not found.",
        };
      }

      const ageRange = age ? age.split("-") : null;
  
      const users = await this.prisma.user.findMany({
        where: {
          id: { not: userId },
          AND: [
            {
              Swipe: {
                none: {
                  fromUserId: userId,
                },
              },
            },
            ...(gender ? [{ profile: { gender } }] : []),
            ...(ageRange
              ? [
                  {
                    profile: {
                      age: {
                        gte: parseInt(ageRange[0]),
                        lte: parseInt(ageRange[1]),
                      },
                    },
                  },
                ]
              : []),
            ...(sexualOrientation ? [{ profile: { sexualOrientation } }] : []),
            ...(lookingFor ? [{ profile: { lookingFor } }] : []),
          ],
        },
        select: {
          id: true,
          email: true,
          isAdmin: true,
          isVerified: true,
          profile: true,
        },
      });
  
      // Filtrer avec la distance Haversine pour plus de précision
      const filteredUsers = users.filter((user) => {
        const distance = haversineDistance(
          { lat: userLatitude, lon: userLongitude },
          { lat: user.profile.latitude, lon: user.profile.longitude }
        );
        return distance <= radiusInKm;
      });
  
      return {
        statusCode: 200,
        users: filteredUsers,
        message: "Users retrieved successfully",
      };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
  

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashPassword(createUserDto.password),
        isVerified: createUserDto.isVerified ?? false,
        isAdmin: createUserDto.isAdmin,
      },
    });

    if (!createUserDto.isVerified) {
      this.sendGrid.sendEmail(
        user.email,
        "Bienvenue sur Elixir",
        "Bonjour, votre compte a été créé avec succès.",
        `<div>
          <p>Bonjour, votre compte Elixir a été créé avec succès.</p>
          <p>Utilisez les identifiants ci-dessous pour vous connecter</p>
          <ul>
            <li>Email: ${user.email}</li>
            <li>Mot de passe: ${createUserDto.password}</li>
          <ul>
        </div>`
      );
    }
    return {
      statusCode: 201,
      user,
      message: "User created successfully",
    };
  }

  /**
   * Updates the password of a user.
   * @param id - The ID of the user.
   * @param updateUserDto - The DTO containing the current password and the new password.
   * @returns An object with the updated user, status code, and a message indicating the result of the operation.
   */
  async updatePassword(id: string, data: UpdateUserPasswordDto) {
    const { currentPassword, password } = data;

    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return {
        statusCode: 404,
        users: purgeUser(user),
        message: "User not found",
      };
    }

    if (!comparePassword(currentPassword, user.password)) {
      return {
        statusCode: 401,
        users: purgeUser(user),
        message: "Current password is invalid",
      };
    }

    try {
      const user = await this.prisma.user.update({
        data: {
          password: hashPassword(password),
        },
        where: {
          id,
        },
      });
      return {
        statusCode: 200,
        users: purgeUser(user),
        message: "User password updated successfully",
      };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * Deletes a user with the specified ID.
   * @param id The ID of the user to delete.
   * @returns An object containing the status code, purged user data, and a success message.
   */
  async delete(id: string) {
    const user = await this.prisma.user.delete({
      where: {
        id,
      },
    });
    return {
      statusCode: 200,
      users: purgeUser(user),
      message: "User deleted successfully",
    };
  }
}
