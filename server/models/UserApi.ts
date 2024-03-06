export type UserApi = {
  id: string;
  email: string;
  password: string;
};

export interface TokenPayload {
  userId: string;
}
