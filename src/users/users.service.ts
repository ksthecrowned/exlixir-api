import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import {
  UpdateUserPasswordDto,
  UpdateUserProfileDto,
} from "./dto/update-user.dto";
import { comparePassword, hashPassword, purgeUser } from "utils/utils";
import { logger } from "utils/logger";
import { CreateUserDto } from "./dto/create-user.dto";
import { SendGridService } from "src/sendgrid.service";

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

  async getAllUSers() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          email: true,
          isAdmin: true,
          id: true,
          isVerified: true,
          profile: true
        },
      });
      return {
        statusCode: 200,
        users,
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
