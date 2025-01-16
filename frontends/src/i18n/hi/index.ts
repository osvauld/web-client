import type { BaseTranslation } from "../i18n-types";

const hi = {
	nav: {
		home: "होम",
		all: "सभी",
		personal: "व्यक्तिगत",
		work: "कार्य",
		favourites: "पसंदीदा",
	},
	search: "खोज",
	all: "सभी खजाने",
	latest: "नवीनतम",
	recents: "हाल का",
	categories: "श्रेणियाँ",
	addNewCredential: "नया क्रेडेंशियल जोड़ें",
	createNewVault: "नया खजाना बनाएं",
	newVault: "नया वॉल्ट",
	tabs: {
		home: "मुख्य पृष्ठ",
		add: "जोड़ें",
		generator: "जनरेटर",
		profile: "प्रोफ़ाइल",
	},
	types: {
		logins: "लॉगिन",
		pins: "पिन",
		creditdebitcards: "क्रेडिट/डेबिट कार्ड",
		notes: "नोट्स",
		contacts: "संपर्क",
		bankaccounts: "बैंक खाते",
		digitalwallets: "डिजिटल वॉलेट",
		sshkeys: "SSH कुंजियाँ",
		apicredentials: "API क्रेडेंशियल",
		databases: "डेटाबेस",
	},
} satisfies BaseTranslation;

export default hi;
