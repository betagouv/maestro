import { DepartmentList } from 'shared/types/Department';
import { PhaseKinds } from 'shared/types/PhaseKind';
import { AuthUser, UserInfos } from 'src/models/User';

const randomstring = require('randomstring');

export const genBoolean = () => Math.random() < 0.5;

export const genSiren = () => genNumber(9);

export function oneOf<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function genEmail() {
  return (
    randomstring.generate({
      length: 10,
      charset: 'alphabetic',
    }) +
    '@' +
    randomstring.generate({
      length: 10,
      charset: 'alphabetic',
    })
  );
}

export function genNumber(length = 10) {
  return randomstring.generate({
    length,
    charset: 'numeric',
  });
}

export function genAuthUser(): AuthUser {
  return {
    accessToken: randomstring.generate(),
    userId: genNumber(10),
  };
}

export function genUserInfos(): UserInfos {
  return {
    email: genEmail(),
    firstName: randomstring.generate(),
    lastName: randomstring.generate(),
    role: oneOf(['Admin', 'Employee']),
    department: oneOf(DepartmentList),
  };
}

export function genUser() {
  return {
    ...genUserInfos(),
    id: randomstring.generate(),
    manager: genBoolean(),
    hourlyRate: genNumber(),
  };
}

export function genProject() {
  return {
    id: randomstring.generate(),
    reference: randomstring.generate(),
    title: randomstring.generate(),
  };
}

export function genPhase() {
  return {
    id: randomstring.generate(),
    project: genProject(),
    kind: oneOf(PhaseKinds),
    initialAmount: genNumber(),
    additionalAmount: genNumber(),
  };
}

export function genHour() {
  return {
    phaseId: randomstring.generate(),
    userId: randomstring.generate(),
    date: new Date(),
    hours: Math.floor(Math.random() * 10),
    project: genProject(),
    phaseKind: oneOf(PhaseKinds),
    cost: genNumber(),
    department: oneOf(DepartmentList),
  };
}
