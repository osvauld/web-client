export type Group = {
  groupId: string;
  name: string;
};
export type GroupWithAccessType = Group & {
  accessType: string;
};
