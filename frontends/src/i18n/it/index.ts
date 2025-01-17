import type { BaseTranslation } from "../i18n-types";

const it = {
	nav: {
		home: "Home",
		all: "Tutto",
		personal: "Personale",
		work: "Lavoro",
		favourites: "Preferiti",
	},
	search: "Cerca",
	all: "Tutti i vault",
	latest: "Ultimi",
	recents: "Recenti",
	categories: "Categorie",
	addNewCredential: "Aggiungi nuova credenziale",
	createNewVault: "Crea nuovo vault",
	newVault: "Nuova cassaforte",
	addATitle: "Aggiungi un titolo",
	import: "Importa",
	selectImportTarget: "Seleziona destinazione importazione",
	cancel: "Annulla",
	copyNote: "Copia nota",
	importTargets: {
		chrome: "Chrome",
		firefox: "Firefox",
		safari: "Safari",
		edge: "Edge",
		opera: "Opera",
		bitwarden: "Bitwarden",
		protonpass: "Proton Pass",
		dashlane: "Dashlane",
		nordpass: "NordPass",
		keepass: "KeePass",
		lastpass: "LastPass",
		roboform: "RoboForm",
		"1password": "1Password",
	},
	tabs: {
		home: "Home",
		add: "Aggiungi",
		generator: "Generatore",
		profile: "Profilo",
	},
	types: {
		logins: "Accessi",
		pins: "PIN",
		creditdebitcards: "Carte di credito/debito",
		notes: "Note",
		contacts: "Contatti",
		bankaccounts: "Conti bancari",
		digitalwallets: "Portafogli digitali",
		sshkeys: "Chiavi SSH",
		apicredentials: "Credenziali API",
		databases: "Database",
	},
} satisfies BaseTranslation;

export default it;
