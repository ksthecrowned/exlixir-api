import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { SwipesController } from "./swipes.controller";
import { SwipesService } from "./swipes.service";
import { MatchesSerice } from "src/matches/matches.service";

@Module({
  controllers: [SwipesController],
  providers: [SwipesService, MatchesSerice, PrismaService],
})
export class SwipesModule {}
