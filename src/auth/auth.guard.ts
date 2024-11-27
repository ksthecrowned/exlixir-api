import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { verifyJwt } from "utils/utils";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException("No authorization header found");
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyJwt(token);
      (request as any).userId = decoded["userId"];
      (request as any).isAdmin = decoded["isAdmin"];
      (request as any).isVerified = decoded["isVerified"];

      if(!decoded) {
        throw new UnauthorizedException("Token is invalid or expired.");
      }

      if (decoded["isVerified"] === false) {
        throw new UnauthorizedException("This user account isn't verified.");
      }
      
      return true;
    } catch (err) {
      throw new UnauthorizedException("Token is invalid or expired.");
    }
  }
}
