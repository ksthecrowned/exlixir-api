import { IsEmail, IsJWT, IsNotEmpty, IsString } from "class-validator";

export class RequestPasswordResetDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
export class PasswordResetDto {
  @IsJWT()
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  password: string;
}

export class LoginAuthDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
