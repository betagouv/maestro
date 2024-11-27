import express from 'express';
import * as jwt from 'jsonwebtoken';
import { MarkRequired } from 'ts-essentials';
import { ProgrammingPlan } from '../../shared/schema/ProgrammingPlan/ProgrammingPlans';
import { TokenPayload } from '../../shared/schema/User/TokenPayload';
import { User } from '../../shared/schema/User/User';

declare global {
  namespace Express {
    interface Request {
      auth?: jwt.JwtPayload & TokenPayload;
      user?: User;
      programmingPlan?: ProgrammingPlan;
      sample?: Sample;
    }
  }
}

declare module 'express-jwt' {
  type AuthenticatedRequest = MarkRequired<express.Request, 'auth' | 'user'>;
  type ProgrammingPlanRequest = MarkRequired<
    express.Request,
    'programmingPlan'
  > & {
    programmingPlan: ProgrammingPlan;
  };
  type SampleRequest = MarkRequired<express.Request, 'sample'>;
}
