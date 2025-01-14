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
	addNew: "Yeni Kimlik Bilgisi Ekle",
	newVault: "Yeni kasa oluştur",
	search: "Ara",
	latest: "Son",
	recents: "Son",
	categories: "Kategoriler",
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
