import type { BaseTranslation } from "../i18n-types";

const de = {
	nav: {
		home: "Startseite",
		all: "Alle",
		personal: "Persönlich",
		work: "Arbeit",
		favourites: "Favoriten",
	},
	search: "Suche",
	all: "Alle Tresore",
	latest: "Neueste",
	recents: "Kürzlich",
	categories: "Kategorien",
	addNewCredential: "Neue Anmeldeinformationen hinzufügen",
	createNewVault: "Neuen Tresor erstellen",
	newVault: "Neuer Tresor",
	tabs: {
		home: "Accueil",
		add: "Ajouter",
		generator: "Générateur",
		profile: "Profil",
	},
	types: {
		logins: "Anmeldungen",
		pins: "PINs",
		creditdebitcards: "Kredit-/Debitkarten",
		notes: "Notizen",
		contacts: "Kontakte",
		bankaccounts: "Bankkonten",
		digitalwallets: "Digitale Geldbörsen",
		sshkeys: "SSH-Schlüssel",
		apicredentials: "API-Zugangsdaten",
		databases: "Datenbanken",
	},
} satisfies BaseTranslation;

export default de;
