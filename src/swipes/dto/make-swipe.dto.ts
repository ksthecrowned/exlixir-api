import { IsBoolean, IsNotEmpty, IsString } from "class-validator"

export class MakeSwipeDto {
    @IsString()
    @IsNotEmpty()
    fromUserId: string

    @IsString()
    @IsNotEmpty()
    toUserId: string
    
    @IsBoolean()
    isLike: boolean
}