export type User = {
  id: string;
  name: string;
  username: string;
  publicKey: string;
};

export type UserWithAccessType = User & {
  accessType: string;
};
