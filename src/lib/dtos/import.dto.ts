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

export type LastpassCredential = {
	name: string;
	url: string;
	username: string;
	password: string;
	totp: string;
	extra: string;
};

export type BitwardenCredential = {
	type: string;
	name: string;
	login_uri: string;
	login_username: string;
	login_password: string;
	login_totp: string;
	notes: string;
};

export type Platform =
	| "Safari"
	| "Firefox"
	| "Chrome"
	| "Opera"
	| "Bitwarden"
	| "Edge"
	| "Dashlane"
	| "1password"
	| "Nordpass"
	| "Passbolt"
	| "Keepass"
	| "Lastpass"
	| "Kaspersky"
	| "Roboform";

export type Credential =
	| SafariCredential
	| FirefoxCredential
	| ChromeCredential
	| LastpassCredential
	| BitwardenCredential;

export type IntermediateCredential = {
	name: string;
	description: string;
	domain: string;
	username: string;
	password: string;
};
