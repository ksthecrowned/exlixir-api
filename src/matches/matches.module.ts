import { Module } from "@nestjs/common";
import { MatchesController } from "./matches.controller";
import { PrismaService } from "src/prisma.service";
import { MatchesSerice } from "./matches.service";

@Module({
  controllers: [MatchesController],
  providers: [MatchesSerice, PrismaService],
})
export class MatchesModule {}