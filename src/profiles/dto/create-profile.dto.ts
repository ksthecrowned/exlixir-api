import { Gender, InterestedIn, LookingFor, Photo, SexualOrientation } from "@prisma/client";

export class CreateProfileDto {
    userId: string;
    username: string;
    bio: string;
    age: number;
    gender: Gender;
    interestedIn: InterestedIn;
    sexualOrientation: SexualOrientation;
    lookingFor: LookingFor;
    location: string;
    photos: Photo[];
}