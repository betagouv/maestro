import { TokenKind } from '../../shared/types/TokenKind';

export interface AccountTokenApi {
  id: string;
  userId: string;
  tokenKind: TokenKind;
  createdAt: Date;
  expiresAt: Date;
}

export const AccountTokenExpiration = 24 * 7;
