export type Environments = {
	id: string;
	cliUser: string;
	name: string;
	createdat: string;
	updatedat: string;
	publicKey: string;
	cliUsername: string;
};

export type EnvironmentFields = {
	credentialId: string;
	credentialName: string;
	fields: {
		fieldId: string;
		fieldName: string;
		fieldValue: string;
	}[];
};

type CliUser = {
	envFieldId: string;
	envId: string;
	cliUserId: string;
	cliUserPublicKey: string;
};

export type CliUsersData = {
	[key: string]: CliUser[];
};
