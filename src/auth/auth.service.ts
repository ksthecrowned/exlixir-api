import { Injectable } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import {
  comparePassword,
  generateJwt,
  hashPassword,
  purgeUser,
} from 'utils/utils';
import { logger } from 'utils/logger';
import { PrismaService } from 'src/prisma.service';
import { SendGridService } from 'src/sendgrid.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sendGrid: SendGridService,
  ) {}

  /**
   * Logs in a user and returns a jwt that can be used for authentication
   * @param loginAuthDto the email and password of the user to log in
   * @param ip the ip address of the user
   * @param isAdmin true if the request is coming from an admin
   * @returns a user object with a jwt and a message
   * @throws if the user does not exist, or if the password is invalid
   */
  async login(loginAuthDto: LoginAuthDto, ip: string, isAdmin: boolean) {
    const { email, password } = loginAuthDto;

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      // Check if user does not exist
      if (!user) {
        return {
          statusCode: 404,
          user: null,
          message: "User doesn't exist",
        };
      }

      // Check if password is valid
      if (comparePassword(password, user.password)) {
        if (!user.isVerified) {
          return {
            statusCode: 403,
            user: null,
            message: 'You are not allowed to login, verify your email first',
          };
        }

        // Generate a jwt
        const jwt = generateJwt({
          userId: user.id,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
        });

        await this.prisma.verificationToken.deleteMany({
          where: {
            userId: user.id,
          },
        })

        await this.prisma.verificationToken.create({
          data: {
            token: jwt,
            userId: user.id,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          },
        })

        // We make sure to remove the password and other fields from the user object
        // Before returning it
        const userWithJwt = {
          ...purgeUser(user),
          jwt,
        };

        this.sendGrid.sendEmail(
          user.email,
          'Nouvelle connexion',
          "Bonjour, un appareil s'est connecté à votre compte.",
          `<div>
            <p>Un appareil s'est connecté à votre compte avec l'adresse IP: ${ip}</p>
            <p>Si vous n'êtes pas à l'origine de cette connexion, veuillez contacter le support.</p>
          </div>`,
        );
        return {
          statusCode: 200,
          user: userWithJwt,
          message: 'User logged in successfully',
        };
      } else {
        return {
          statusCode: 401,
          user: null,
          message: 'Invalid credentials',
        };
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * Registers a new user.
   * @param registerAuthDto - The DTO containing the email and password of the user.
   * @returns An object with the created user, status code, and a message indicating the result of the operation.
   */
  async register(registerAuthDto: RegisterAuthDto) {
    const { email, password } = registerAuthDto;

    try {
      let user = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        return {
          statusCode: 409,
          user: null,
          message: 'This email is already taken',
        };
      }

      user = await this.prisma.user.create({
        data: {
          email,
          password: hashPassword(password),
        },
      })

      const jwt = generateJwt({
        userId: user.id,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      })

      // We make sure to remove the password and other fields from the user object
      // Before returning it
      const userWithJwt = {
        ...purgeUser(user),
        jwt,
      }

      return {
        statusCode: 201,
        user: userWithJwt,
        message: 'User registered successfully',
      };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * Verifies a user's email address using a verification token.
   * @param token - The verification token sent to the user's email address.
   * @returns An object containing the status code, and a message indicating the result of the operation.
   * @throws An error if there was a problem validating the user's email address.
   */
  async verifyEmailAddress(token: string) {
    try {
      const tokenIsValid = await this.prisma.verificationToken.findFirst({
        where: {
          token,
          expiresAt: {
            gt: new Date(),
          }
        }
      });
  
      if (!tokenIsValid) {
        return {
          statusCode: 403,
          message: 'Invalid or expired token. Please request a new one.',
        };
      }
  
      const userId = tokenIsValid.userId;
  
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
  
      if (user.isVerified) {
        return {
          statusCode: 200,
          message:
            'This user email address is already verified. No additionnal action is needed.',
        };
      }
  
      if (!user) {
        return {
          statusCode: 404,
          message: 'No user found for the provided userId',
        };
      }
  
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isVerified: true,
        },
      });
  
      return {
        statusCode: 200,
        message: 'Email address verfied successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sends an email verification code to the user with the given ID.
   * @param userId - The ID of the user to send the verification email to.
   * @returns An object containing the status code and a message indicating the result of the operation.
   * @throws An error if there was a problem sending the verification email.
   */
  async sendEmailVerificationCode(userId: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
  
      if (!user) {
        return {
          statusCode: 404,
          message: 'User with the provided ID not found',
        }
      }
  
      const token = generateJwt({
        userId: user.id,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      })
  
      const record = await this.prisma.verificationToken.create({
        data: {
          token: token,
          userId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      })
  
      await this.sendGrid.sendEmail(
        user.email,
        'Vérifiez votre adresse email',
        'Bonjour, cliquez sur le lien ci-dessous pour vérifier votre adresse email:',
        `<a href='http://localhost:3000/verify-email?token=${record.token}'>Verifier l'adresse email</a>`,
      );
  
      return {
        statusCode: 200,
        message: 'A verification email has been sent successfully',
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sends a password reset email to the user with the given email.
   * @param email - The email address of the user to send the password reset email to.
   * @returns An object with a status code and a message indicating the result of the operation.
   */
  async requestPasswordReset(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
  
      if (!user) {
        return {
          statusCode: 404,
          message: 'No user found for the provided email',
        };
      }
      const token = generateJwt({
        userId: user.id,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      })
  
      const record = await this.prisma.verificationToken.create({
        data: {
          token: token,
          userId: user.id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      })
      await this.sendGrid.sendEmail(
        email,
        'Réninitialiser votre mot de passe',
        'Bonjour, cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe.',
        `<a href='http://localhost:3000/password-reset?token=${record.token}'>Réninitialiser le mot de passe</a>`,
      )
  
      return {
        statusCode: 200,
        message: 'A password reset email has been sent successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resets the password of a user using a verification token.
   * @param token - The verification token for resetting the password.
   * @param password - The new password to set for the user.
   * @returns An object containing the status code and a message indicating the result of the operation.
   * @throws If the token is invalid or expired, or if the user is not found.
   */
  async resetPassword(token: string, password: string) {
    try {
      const tokenIsValid = await this.prisma.verificationToken.findFirst({
        where: {
          token,
          expiresAt: {
            gt: new Date(),
          },
        },
      })
  
      if(!tokenIsValid) {
        return {
          statusCode: 403,
          message: 'Invalid or expired token. Please request a new one.',
        };
      }
  
      const userId = tokenIsValid.userId
  
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      })
  
      if (!user) {
        return {
          statusCode: 404,
          message: 'User not found',
        }
      }
  
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: hashPassword(password),
        },
      });
  
      return {
        statusCode: 200,
        message: 'Password updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
