import { IsNotEmpty, IsString } from "class-validator";

export class CreateMatchDto {
    @IsNotEmpty()
    @IsString()
    user1Id: string

    @IsNotEmpty()
    @IsString()
    user2Id: string
}