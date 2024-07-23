type accessType = "reader" | "manager";
type accessSource = "acquired" | "inherited";
export type Group = {
	groupId: string;
	name: string;
	accessType: accessType;
	accessSource?: accessSource;
};
