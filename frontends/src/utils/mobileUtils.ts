import CreditCard from "../icons/creditCard.svelte";
import KeyIcon from "../icons/mobileKey.svelte";
import LoginIcon from "../icons/pwdGen.svelte";
import MobileOldKey from "../icons/mobileOldKey.svelte";
import MobileBank from "../icons/mobileBank.svelte";
import MobileDatabase from "../icons/mobileDatabase.svelte";
import MobileApiIcon from "../icons/mobileApiIcon.svelte";
import MobileNote from "../icons/mobileNote.svelte";
import MobileContact from "../icons/mobileContact.svelte";
import MobileWallet from "../icons/mobileWallet.svelte";

export const CATEGORIES = [
	{ id: "logins", name: "Login", icon: LoginIcon },
	{ id: "pins", name: "PIN", icon: KeyIcon },
	{ id: "creditdebitcards", name: "Credit/DebitCard", icon: CreditCard },
	{ id: "notes", name: "Note", icon: MobileNote },
	{ id: "contacts", name: "Contact", icon: MobileContact },
	{ id: "bankaccounts", name: "Bank Account", icon: MobileBank },
	{ id: "digitalwallets", name: "Digital Wallet", icon: MobileWallet },
	{ id: "sshkeys", name: "SSH Key", icon: MobileOldKey },
	{ id: "apicredentials", name: "API Key", icon: MobileApiIcon },
	{ id: "databases", name: "Database", icon: MobileDatabase },
];

export const THEMES = {
	one: "#FAB387",
	two: "#89B4FA",
	three: "#A6E3A1",
};

export const credentialFieldsUpdater = (type: string) => {
	switch (type) {
		case "Login":
			return [
				{ fieldName: "Username", fieldValue: "", sensitive: false },
				{ fieldName: "Password", fieldValue: "", sensitive: true },
				{ fieldName: "URL", fieldValue: "https://", sensitive: false },
				{ fieldName: "TOTP", fieldValue: "", sensitive: true },
			];
		case "Credit/DebitCard":
			return [
				{ fieldName: "Name", fieldValue: "", sensitive: false },
				{ fieldName: "Card Number", fieldValue: "", sensitive: true },
				{ fieldName: "Expiration Date", fieldValue: "", sensitive: false },
				{ fieldName: "CVV", fieldValue: "", sensitive: true },
				{ fieldName: "Type", fieldValue: "", sensitive: false },
				{ fieldName: "Bank/Issuer", fieldValue: "", sensitive: false },
			];
		case "Contact":
			return [
				{ fieldName: "Name", fieldValue: "", sensitive: false },
				{ fieldName: "Email", fieldValue: "", sensitive: false },
				{ fieldName: "Phone", fieldValue: "", sensitive: false },
				{ fieldName: "Address", fieldValue: "", sensitive: false },
			];
		case "Digital Wallet":
			return [
				{ fieldName: "Wallet Name", fieldValue: "", sensitive: false },
				{ fieldName: "Wallet Address", fieldValue: "", sensitive: true },
				{ fieldName: "Private Key", fieldValue: "", sensitive: true },
			];
		case "SSH Key":
			return [
				{ fieldName: "Key Name", fieldValue: "", sensitive: false },
				{ fieldName: "Public Key", fieldValue: "", sensitive: false },
				{ fieldName: "Private Key", fieldValue: "", sensitive: true },
				{ fieldName: "Passphrase", fieldValue: "", sensitive: true },
			];
		case "Database":
			return [
				{ fieldName: "Database Name", fieldValue: "", sensitive: false },
				{ fieldName: "Host", fieldValue: "", sensitive: false },
				{ fieldName: "Port", fieldValue: "", sensitive: false },
				{ fieldName: "Username", fieldValue: "", sensitive: false },
				{ fieldName: "Password", fieldValue: "", sensitive: true },
			];
		case "PIN":
			return [
				{ fieldName: "PIN Name", fieldValue: "", sensitive: false },
				{ fieldName: "PIN", fieldValue: "", sensitive: true },
			];
		case "Note":
			return [{ fieldName: "Note1", fieldValue: "", sensitive: false }];
		case "Bank Account":
			return [
				{ fieldName: "Account Holder", fieldValue: "", sensitive: false },
				{ fieldName: "Account Number", fieldValue: "", sensitive: true },
				{ fieldName: "Routing Number", fieldValue: "", sensitive: true },
				{ fieldName: "Bank Name", fieldValue: "", sensitive: false },
				{ fieldName: "Account Type", fieldValue: "", sensitive: false },
			];
		case "Social Media":
			return [
				{ fieldName: "Platform", fieldValue: "", sensitive: false },
				{ fieldName: "Username", fieldValue: "", sensitive: false },
				{ fieldName: "Password", fieldValue: "", sensitive: true },
				{ fieldName: "Profile URL", fieldValue: "", sensitive: false },
			];
		case "API Key":
			return [
				{ fieldName: "Osvauld Name", fieldValue: "", sensitive: false },
				{ fieldName: "API Name", fieldValue: "", sensitive: false },
				{ fieldName: "API Key", fieldValue: "", sensitive: true },
				{ fieldName: "API Secret", fieldValue: "", sensitive: true },
				{ fieldName: "Endpoint", fieldValue: "", sensitive: false },
				{ fieldName: "Description", fieldValue: "", sensitive: false },
			];
		default:
			return [];
	}
};
