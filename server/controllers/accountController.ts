import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { constants } from 'http2';
import jwt from 'jsonwebtoken';
import AuthenticationFailedError from '../../shared/errors/authenticationFailedError';
import { SignIn } from '../../shared/schema/SignIn';
import { TokenPayload } from '../../shared/schema/User/TokenPayload';
import userRepository from '../repositories/userRepository';
import config from '../utils/config';

const signIn = async (request: Request, response: Response) => {
  const { email, password } = request.body as SignIn;

  const user = await userRepository.findOne(email);
  if (!user) {
    throw new AuthenticationFailedError();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationFailedError();
  }

  const accessToken = jwt.sign(
    {
      userId: user.id,
    } as TokenPayload,
    config.auth.secret,
    { expiresIn: config.auth.expiresIn }
  );

  return response.status(constants.HTTP_STATUS_OK).json({
    userId: user.id,
    accessToken,
    userRole: user.role,
  });
};

export default {
  signIn,
};
