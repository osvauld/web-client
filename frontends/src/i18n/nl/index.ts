import type { BaseTranslation } from "../i18n-types";

const nl = {
	nav: {
		home: "Home",
		all: "Alles",
		personal: "Persoonlijk",
		work: "Werk",
		favourites: "Favorieten",
	},
	search: "Zoeken",
	all: "Alle kluizen",
	latest: "Laatste",
	recents: "Recente",
	categories: "Categorieën",
	addNewCredential: "Nieuwe referentie toevoegen",
	createNewVault: "Nieuwe kluis maken",
	newVault: "Nieuwe kluis",
	tabs: {
		home: "Home",
		add: "Toevoegen",
		generator: "Generator",
		profile: "Profiel",
	},
	types: {
		logins: "Inloggegevens",
		pins: "PIN-codes",
		creditdebitcards: "Credit-/debitkaarten",
		notes: "Notities",
		contacts: "Contacten",
		bankaccounts: "Bankrekeningen",
		digitalwallets: "Digitale portemonnees",
		sshkeys: "SSH-sleutels",
		apicredentials: "API-inloggegevens",
		databases: "Databases",
	},
} satisfies BaseTranslation;

export default nl;
