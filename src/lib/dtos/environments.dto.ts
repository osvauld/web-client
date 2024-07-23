export type Environments = {
	id: string;
	cliUser: string;
	name: string;
	createdAt: string;
	updatedAt: string;
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
