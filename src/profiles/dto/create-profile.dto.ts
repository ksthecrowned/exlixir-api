import { InterestedIn, Photo } from "@prisma/client";

export class CreateProfileDto {
    userId: string;
    username: string;
    bio: string;
    age: number;
    gender: string;
    interestedIn: InterestedIn;
    location: string;
    photos: Photo[];
}