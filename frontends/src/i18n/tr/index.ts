import type { BaseTranslation } from "../i18n-types";

const tr = {
	nav: {
		home: "Ana Sayfa",
		all: "Tümü",
		personal: "Kişisel",
		work: "İş",
		favourites: "Favoriler",
	},
	all: "Tüm kasalar",
	search: "Ara",
	latest: "Son",
	recents: "Son",
	categories: "Kategoriler",
	addNewCredential: "Yeni Kimlik Bilgisi Ekle",
	createNewVault: "Yeni kasa oluştur",
	newVault: "Yeni Kasa",
	tabs: {
		home: "Ana Sayfa",
		add: "Ekle",
		generator: "Üreteç",
		profile: "Profil",
	},
	types: {
		logins: "Girişler",
		pins: "PIN kodları",
		creditdebitcards: "Kredi/Banka Kartları",
		notes: "Notlar",
		contacts: "Kişiler",
		bankaccounts: "Banka Hesapları",
		digitalwallets: "Dijital Cüzdanlar",
		sshkeys: "SSH Anahtarları",
		apicredentials: "API Kimlik Bilgileri",
		databases: "Veritabanları",
	},
} satisfies BaseTranslation;

export default tr;
