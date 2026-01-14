import * as jwt from 'jsonwebtoken';
import { TokenPayload } from 'maestro-shared/schema/User/TokenPayload';
import { UserRefined } from 'maestro-shared/schema/User/User';

declare global {
  namespace Express {
    interface Request {
      auth?: jwt.JwtPayload & TokenPayload;
      user?: UserRefined;
      userRole: UserRole;
    }
  }
}
