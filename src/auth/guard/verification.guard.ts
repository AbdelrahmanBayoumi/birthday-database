import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Observable } from 'rxjs';

@Injectable()
export class VerificationGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user; // Assuming you have a user object available after authentication

    if (user && !user.isVerified) {
      // User has not been verified, deny access
      return false;
    }

    // User is verified, allow access
    return true;
  }
}
