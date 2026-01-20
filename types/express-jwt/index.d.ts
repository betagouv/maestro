import * as jwt from 'jsonwebtoken';
import { AuthUserTransformed } from 'maestro-shared/schema/User/AuthUser';
import { TokenPayload } from 'maestro-shared/schema/User/TokenPayload';

declare global {
  namespace Express {
    interface Request extends AuthUserTransformed {
      auth?: jwt.JwtPayload & TokenPayload;
    }
  }
}
