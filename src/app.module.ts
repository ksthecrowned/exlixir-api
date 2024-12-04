import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SendGridService } from './sendgrid.service';
import { SwipesModule } from './swipes/swipes.module';
import { MatchesModule } from './matches/matches.module';
import { ProfilesModule } from './profiles/profiles.module';
import { MessagesModule } from './messages/messages.module';
import { RedisService } from './redis.service';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { WebhookModule } from './webhook/webhook.module';
import { MomoModule } from './momo/momo.module';

@Module({
  imports: [
    AuthModule, 
    UsersModule, 
    SwipesModule, 
    MatchesModule,
    ProfilesModule,
    MessagesModule,
    SubscriptionsModule,
    WebhookModule,
    MomoModule
  ],
  controllers: [],
  providers: [
    PrismaService, 
    SendGridService, 
    RedisService,
  ],
})
export class AppModule {}
