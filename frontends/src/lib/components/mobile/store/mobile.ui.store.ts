import { writable, derived } from "svelte/store";

interface UIState {
	currentVault: string;
	vaultSwitchActive: boolean;
	selectedCredentialType: string;
	categorySelection: boolean;
}

const initialState: UIState = {
	currentVault: "all",
	vaultSwitchActive: false,
	selectedCredentialType: "",
	categorySelection: false,
};

export const uiState = writable<UIState>(initialState);

export const uiStateActions = {
	setCredentialType: (type: string) => {
		uiState.update((state) => ({
			...state,
			selectedCredentialType: type,
		}));
	},

	setCategorySelection: (isSelected: boolean) => {
		uiState.update((state) => ({
			...state,
			categorySelection: isSelected,
		}));
	},

	setVaultSwitchActive: (isSelected: boolean) => {
		uiState.update((state) => ({
			...state,
			vaultSwitchActive: isSelected,
		}));
	},

	setCurrentVault: (type: string) => {
		uiState.update((state) => ({
			...state,
			currentVault: type,
		}));
	},

	resetState: () => {
		uiState.set(initialState);
	},
};
