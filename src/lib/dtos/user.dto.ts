export type User = {
  checked: boolean;
  selectedOption: string;
  id: string;
  name: string;
  username: string;
  publicKey: string;
};

export type UserWithAccessType = User & {
  accessType: string;
};
