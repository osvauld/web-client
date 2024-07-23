export type User = {
	id: string;
	name: string;
	username: string;
	publicKey?: string;
	type?: string;
	status?: string;
	checked?: boolean;
};

export type UserWithAccessType = User & {
	accessType: string;
};
