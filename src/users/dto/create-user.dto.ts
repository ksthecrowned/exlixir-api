import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    description: "The user email",
    example: "a@b.c",
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "The user password",
    example: "password",
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsBoolean()
  isVerified?: boolean;

  @IsBoolean()
  isAdmin?: boolean;
}
