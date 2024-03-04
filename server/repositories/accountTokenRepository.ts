import db from './db';
import { AccountTokenApi } from '../models/AccountTokenApi';
import { TokenKind } from '../../shared/types/TokenKind';

export const accountTokensTable = 'account_tokens';

const AccountTokens = () => db<AccountTokenDbo>(accountTokensTable);
const get = async (accountTokenId: string): Promise<AccountTokenApi | null> => {
  console.log('Get AccountTokenApi with id', accountTokenId);
  const accountToken = await AccountTokens()
    .where('id', accountTokenId)
    .first();
  return accountToken ? parseAccountTokenApi(accountToken) : null;
};

const upsert = async (accountTokenApi: AccountTokenApi): Promise<void> => {
  console.log('Upsert AccountTokenApi', accountTokenApi);
  await AccountTokens()
    .insert(formatAccountTokenApi(accountTokenApi))
    .onConflict(['user_id', 'kind'])
    .merge();
};

const remove = async (id: string): Promise<void> => {
  console.log('Delete accountTokenApi with id', id);
  await AccountTokens().where({ id }).delete();
};

export interface AccountTokenDbo {
  id: string;
  user_id: string;
  kind: TokenKind;
  created_at: Date;
  expires_at: Date;
}

const formatAccountTokenApi = (
  accountTokenApi: AccountTokenApi
): AccountTokenDbo => ({
  id: accountTokenApi.id,
  user_id: accountTokenApi.userId,
  kind: accountTokenApi.tokenKind,
  created_at: accountTokenApi.createdAt,
  expires_at: accountTokenApi.expiresAt,
});

const parseAccountTokenApi = (accountTokenDbo: AccountTokenDbo) =>
  <AccountTokenApi>{
    id: accountTokenDbo.id,
    userId: accountTokenDbo.user_id,
    tokenKind: accountTokenDbo.kind,
    createdAt: accountTokenDbo.created_at,
    expiresAt: accountTokenDbo.expires_at,
  };

export default {
  get,
  upsert,
  remove,
  formatAccountTokenApi,
  parseAccountTokenApi,
};
