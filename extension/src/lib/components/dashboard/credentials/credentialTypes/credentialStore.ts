import { writable } from "svelte/store";
import { CredentialFieldComponentProps } from "../../dtos";

export type CredentialType = "Login" | "Custom" | "Note";

export interface CredentialStoreData {
	name: string;
	description: string;
	credentialType: CredentialType;
	credentialFields: CredentialFieldComponentProps[];
	usersToShare: { id: string; publicKey: string }[];
}

const initialState: CredentialStoreData = {
	name: "",
	description: "",
	credentialType: "Login",
	credentialFields: [],
	usersToShare: [],
};

export const credentialFieldsStore = writable([
	{ fieldName: "Username", fieldValue: "", sensitive: false },
	{ fieldName: "Password", fieldValue: "", sensitive: true },
	{ fieldName: "URL", fieldValue: "https://", sensitive: false },
	{ fieldName: "TOTP", fieldValue: "", sensitive: true },
]);
export const credentialStore = writable<CredentialStoreData>(initialState);

export const updateCredentialStore = (
	data: Partial<CredentialStoreData>,
): void => {
	credentialStore.update((store) => ({ ...store, ...data }));
};

export const resetCredentialStore = (): void => {
	credentialStore.set(initialState);
};
