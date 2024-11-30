import { Controller, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { SubscriptionsService } from "./subscriptions.service";

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(AuthGuard)
export class SubscriptionsController {

    constructor(
        private readonly subscriptionsService: SubscriptionsService
    ) {}
}