import { IsString } from "class-validator"

export class SendMessageDto {
    @IsString()
    senderId: string

    @IsString()
    matchId: string

    @IsString()
    content: string
}