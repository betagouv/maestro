import express from 'express';
import * as jwt from 'jsonwebtoken';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { TokenPayload } from 'maestro-shared/schema/User/TokenPayload';
import { User } from 'maestro-shared/schema/User/User';

declare global {
  namespace Express {
    interface Request {
      auth?: jwt.JwtPayload & TokenPayload;
      user?: User;
      programmingPlan?: ProgrammingPlan;
      sample?: Sample;
      prescription?: Prescription;
      regionalPrescription?: RegionalPrescription;
    }
  }
}

export declare type MarkRequired<
  Type,
  Keys extends keyof Type
> = Type extends Type ? Omit<Type, Keys> & Required<Pick<Type, Keys>> : never;

declare module 'express-jwt' {
  type AuthenticatedRequest = MarkRequired<express.Request, 'auth' | 'user'>;
  type ProgrammingPlanRequest = MarkRequired<
    express.Request,
    'programmingPlan'
  > & {
    programmingPlan: ProgrammingPlan;
  };
  type SampleRequest = MarkRequired<express.Request, 'sample'>;
  type PrescriptionRequest = ProgrammingPlanRequest &
    MarkRequired<express.Request, 'prescription'> & {
      prescription: Prescription;
    };
  type RegionalPrescriptionRequest = MarkRequired<
    express.Request,
    'regionalPrescription'
  > & {
    regionalPrescription: RegionalPrescription;
  };
}
