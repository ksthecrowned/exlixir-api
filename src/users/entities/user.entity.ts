import { Profile } from "@prisma/client";

export class User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt?: Date;
  profile: Profile

  constructor(init: Partial<User>) {
    Object.assign(this, init);
  }
}
