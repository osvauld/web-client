import type { BaseTranslation } from "../i18n-types";

const ar = {
	nav: {
		home: "الرئيسية",
		all: "الكل",
		personal: "شخصي",
		work: "العمل",
		favourites: "المفضلة",
	},
	addNew: "إضافة بيانات اعتماد جديدة",
	all: "جميع الخزائن",
	latest: "الأحدث",
	recents: "الأخيرة",
	categories: "الفئات",
	search: "بحث",
	newVault: "إنشاء خزنة جديدة",
	tabs: {
		home: "الصفحة الرئيسية",
		add: "إضافة",
		generator: "مولد",
		profile: "الملف الشخصي",
	},
	types: {
		logins: "تسجيلات الدخول",
		pins: "أرقام التعريف الشخصي",
		creditdebitcards: "بطاقات الائتمان/الخصم",
		notes: "ملاحظات",
		contacts: "جهات الاتصال",
		bankaccounts: "الحسابات المصرفية",
		digitalwallets: "المحافظ الرقمية",
		sshkeys: "مفاتيح SSH",
		apicredentials: "بيانات اعتماد API",
		databases: "قواعد البيانات",
	},
} satisfies BaseTranslation;

export default ar;
