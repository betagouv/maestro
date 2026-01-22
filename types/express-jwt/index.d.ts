import * as jwt from 'jsonwebtoken';
import { AuthUserRefined } from 'maestro-shared/schema/User/AuthUser';
import { TokenPayload } from 'maestro-shared/schema/User/TokenPayload';

declare global {
  namespace Express {
    interface Request extends AuthUserRefined {
      auth?: jwt.JwtPayload & TokenPayload;
    }
  }
}
