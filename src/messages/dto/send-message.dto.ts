import { IsString } from "class-validator"

export class SendMessageDto {
    @IsString()
    senderId: string

    @IsString()
    recipientId: string

    @IsString()
    content: string
}