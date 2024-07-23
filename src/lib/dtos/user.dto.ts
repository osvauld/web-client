type accessType = "reader" | "manager";
type accessSource = "acquired" | "inherited";

export type User = {
	id: string;
	name: string;
	username: string;
	publicKey?: string;
	type?: string;
	status?: string;
	checked?: boolean;
	accessType?: accessType;
	accessSource?: accessSource;
};
