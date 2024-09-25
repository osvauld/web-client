type accessType = "reader" | "manager";
type accessSource = "acquired" | "inherited";
export type Group = {
	groupId: string;
	name: string;
	accessType?: accessType;
	accessSource?: accessSource;
};

type GroupAccess = "admin" | "member";
export type SelectedGroup = {
	groupId: string;
	name: string;
	accessType: GroupAccess;
};
