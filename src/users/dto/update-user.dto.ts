import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsArray,
  IsNotEmpty,
  IsNumber,
} from "class-validator";

import { InterestedIn, Photo } from "@prisma/client"

export class UpdateUserProfileDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string

  @IsString()
  @IsNotEmpty()
  username: string

  @IsOptional()
  @IsString()
  bio: string

  @IsNumber()
  @IsNotEmpty()
  age: number

  @IsString()
  @IsNotEmpty()
  gender: string

  @IsString()
  @IsNotEmpty()
  interestedIn: InterestedIn

  @IsString()
  @IsNotEmpty()
  location: string

  @IsArray()
  @IsNotEmpty()
  photos: Photo[]
}

export class UpdateUserPasswordDto {
  @IsString()
  password: string;

  @IsString()
  currentPassword: string;
}
