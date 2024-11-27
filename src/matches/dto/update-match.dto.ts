import { Message } from "@prisma/client";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateMatchDto {
    @IsNotEmpty()
    @IsString()
    id: string

    @IsNotEmpty()
    @IsString()
    user1Id: string

    @IsNotEmpty()
    @IsString()
    user2Id: string

    messages: Message[]
}