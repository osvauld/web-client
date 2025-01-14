import type { BaseTranslation } from "../i18n-types";

const it = {
	nav: {
		home: "Home",
		all: "Tutto",
		personal: "Personale",
		work: "Lavoro",
		favourites: "Preferiti",
	},
	addNew: "Aggiungi nuova credenziale",
	search: "Cerca",
	all: "Tutti i vault",
	latest: "Ultimi",
	recents: "Recenti",
	categories: "Categorie",
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
