import * as jwt from 'jsonwebtoken';
import { TokenPayload } from 'maestro-shared/schema/User/TokenPayload';
import { User } from 'maestro-shared/schema/User/User';

declare global {
  namespace Express {
    interface Request {
      auth?: jwt.JwtPayload & TokenPayload;
      user?: User;
      userRole: UserRole;
    }
  }
}
