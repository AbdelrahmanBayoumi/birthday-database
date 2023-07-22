// sanitization.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class UserSensitiveDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (typeof data === 'object' && data !== null) {
          delete data.hash;
          delete data.createdAt;
          delete data.updatedAt;
          delete data.hashedRt;
          return data;
        } else {
          return data;
        }
      }),
    );
  }
}
