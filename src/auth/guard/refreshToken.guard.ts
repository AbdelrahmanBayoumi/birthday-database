import { AuthGuard } from '@nestjs/passport';

/**
 * guard to check if the refresh token is valid and belongs to the user and add the user to the request object
 */
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
}
