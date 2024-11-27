import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SendGridService } from './sendgrid.service';
import { SwipesModule } from './swipes/swipes.module';
import { MatchesModule } from './matches/matches.module';
import { ProfilesModule } from './profiles/profiles.module';
import { FeedModule } from './feed/feed.module';

@Module({
  imports: [
    AuthModule, 
    UsersModule, 
    SwipesModule, 
    MatchesModule,
    ProfilesModule,
    FeedModule
  ],
  controllers: [],
  providers: [PrismaService, SendGridService],
})
export class AppModule {}
