export type SafariCredential = {
	Title: string;
	URL: string;
	Username: string;
	Password: string;
	Notes: string;
	OTPAuth: string;
};

export type FirefoxCredential = {
	url: string;
	username: string;
	password: string;
	httpRealm: string;
	formActionOrigin: string;
	guid: string;
	timeCreated: string;
	timeLastUsed: string;
	timePasswordChanged: string;
};

export type ChromeCredential = {
	name: string;
	url: string;
	username: string;
	password: string;
	note: string;
};

export type Platform = "Safari" | "Firefox" | "Chrome";

export type Credential =
	| SafariCredential
	| FirefoxCredential
	| ChromeCredential;

export type IntermediateCredential = {
	name: string;
	description: string;
	domain: string;
	username: string;
	password: string;
};
