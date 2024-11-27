import {
  Controller,
  Post,
  Body,
  Res,
  ValidationPipe,
  UsePipes,
  BadRequestException,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import {
  LoginAuthDto,
  PasswordResetDto,
  RequestPasswordResetDto,
} from './dto/login-auth.dto';
import { isValidPassword } from 'utils/utils';
import { validate } from 'class-validator';
import { ApiBody, ApiTags } from '@nestjs/swagger';

/**
 * Controller for handling authentication related requests
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Handles a login request.
   *
   * @param credentials the login credentials
   * @param res the response
   * @param req the request
   *
   * @throws {BadRequestException} if the credentials are invalid
   * @throws {InternalServerErrorException} if there was an internal server error
   */
  @ApiBody({
    description: 'Login credentials',
    schema: {
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: '1K6Ht@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    }
  })
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body() credentials: LoginAuthDto,
    @Res() res: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    try {
      const errors = await validate(credentials);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }
      const response = await this.authService.login(credentials, req.ip, false);
      return res.status(response.statusCode).send(response);
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }

  /**
   * Handles a login request specifically for admin users.
   *
   * @param credentials the login credentials
   * @param res the response
   * @param req the request
   *
   * @throws {BadRequestException} if the credentials are invalid
   * @throws {InternalServerErrorException} if there was an internal server error
   */
  @ApiBody({
    description: 'Login credentials',
    schema: {
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: '1K6Ht@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    }
  })
  @Post('admin/login')
  @UsePipes(new ValidationPipe())
  async loginForAdmins(
    @Body() credentials: LoginAuthDto,
    @Res() res: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    try {
      const errors = await validate(credentials);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      const response = await this.authService.login(credentials, req.ip, true);
      return res.status(response.statusCode).send(response);
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }

  /**
   * Handles a registration request.
   *
   * @param registerAuthDto the user data and password
   * @param res the response
   *
   * @throws {BadRequestException} if the password is invalid (doesn't contain a special character, a number and is at least 6 characters long)
   * @throws {InternalServerErrorException} if there was an internal server error
   *
   * @returns An object with the created user, status code and a message indicating the result of the operation.
   */
  @ApiBody({
    description: 'Register credentials',
    schema: {
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: '1K6Ht@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    }
  })
  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(
    @Body() registerAuthDto: RegisterAuthDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const errors = await validate(registerAuthDto);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      if (!isValidPassword(registerAuthDto.password)) {
        return res.status(400).send({
          statusCode: 400,
          user: null,
          message:
            'Invalid password. The password must contain a special character, a number and be at least 6 characters long',
        });
      }
      const response = await this.authService.register(registerAuthDto);
      await this.authService.sendEmailVerificationCode(response.user.id);
      return res.status(response.statusCode).send(response);
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }

  /**
   * Requests a verification email to be sent to the user with the given ID.
   *
   * @param userId the ID of the user to send the verification email to
   * @param res the response
   *
   * @throws {InternalServerErrorException} if there was an internal server error
   *
   * @returns An object with the status code and a message indicating the result of the operation.
   */
  @Get('request-verification-email/:userId')
  async requestVerificationEmail(
    @Res() res: FastifyReply,
    @Param('userId') userId: string,
  ) {
    try {
      const response = await this.authService.sendEmailVerificationCode(userId);
      return res.status(response.statusCode).send(response);
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }

  /**
   * Verifies a user's email address using the provided token.
   *
   * @param res - The HTTP response object.
   * @param token - The verification token sent to the user's email address.
   *
   * @returns A response with the status code and a message indicating the result of the verification.
   *
   * @throws {InternalServerErrorException} if there was an internal server error.
   */
  @Get('verify-email/:token')
  async verifyEmail(
    @Res() res: FastifyReply,
    @Param('token') token: string,
  ) {
    try {
      const response = await this.authService.verifyEmailAddress(token);
      return res.status(response.statusCode).send(response);
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }

  /**
   * Handles the request to send a password reset email to the user with the provided email address.
   *
   * @param res - The HTTP response object.
   * @param requestPasswordResetDto - The DTO containing the email address of the user requesting a password reset.
   *
   * @returns A response with the status code and a message indicating the result of the password reset request.
   *
   * @throws {BadRequestException} if the validation of the requestPasswordResetDto fails.
   * @throws {InternalServerErrorException} if there was an internal server error.
   */
  @ApiBody({
    description: 'Request password reset',
    schema: {
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email', example: '1K6Ht@example.com' },
      },
    }
  })
  @Post('request-password-reset')
  @UsePipes(new ValidationPipe())
  async requestPasswordReset(
    @Res() res: FastifyReply,
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    try {
      const errors = await validate(requestPasswordResetDto);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }
      const response = await this.authService.requestPasswordReset(
        requestPasswordResetDto.email,
      );
      return res.status(response.statusCode).send(response);
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }

  /**
   * Resets the password for a user.
   *
   * @param res - The HTTP response object.
   * @param passwordResetDto - The DTO containing the user ID, token, and new password.
   *
   * @returns A response with the status code and a message indicating the result of the password reset.
   *
   * @throws {BadRequestException} if the validation of the passwordResetDto fails.
   * @throws {InternalServerErrorException} if there was an internal server error.
   */
  @ApiBody({
    description: 'Request password reset',
    schema: {
      required: ['token'],
      properties: {
        token: { type: 'string', format: 'jwt', example: 'eyJhb................eyJ1..........-ql6zme6ihc' },
        password: { type: 'string', example: 'password123' },
      },
    }
  })
  @Post('reset-password')
  async resetPassword(
    @Res() res: FastifyReply,
    @Body() passwordResetDto: PasswordResetDto,
  ) {
    try {
      const errors = await validate(passwordResetDto);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      if (!isValidPassword(passwordResetDto.password)) {
        return res.status(400).send({
          statusCode: 400,
          message:
            'Invalid password. The password must contain a special character, a number and be at least 6 characters long',
        });
      }

      const response = await this.authService.resetPassword(
        passwordResetDto.token,
        passwordResetDto.password,
      );
      return res.status(response.statusCode).send(response);
    } catch (error) {
      return res.status(500).send('Internal server error');
    }
  }
}
