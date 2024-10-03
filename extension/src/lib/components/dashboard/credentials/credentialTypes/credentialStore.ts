
import { writable } from 'svelte/store';
import {
  CredentialFieldComponentProps
} from "../../dtos";


export interface CredentialStoreData {
  name: string;
  description: string;
  credentialType: 'Login' | 'Custom' | 'Note';
  credentialFields: CredentialFieldComponentProps[];
  usersToShare: { id: string; publicKey: string }[];
}


const initialState: CredentialStoreData = {
  name: '',
  description: '',
  credentialType: 'Login',
  credentialFields: [],
  usersToShare: [],
};


export const credentialStore = writable<CredentialStoreData>(initialState);


export const updateCredentialStore = (data: Partial<CredentialStoreData>): void => {
  credentialStore.update(store => ({ ...store, ...data }));
};

export const resetCredentialStore = (): void => {
  credentialStore.set(initialState);
};