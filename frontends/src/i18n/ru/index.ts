import type { BaseTranslation } from "../i18n-types";

const ru = {
	nav: {
		home: "Главная",
		all: "Все",
		personal: "Личное",
		work: "Работа",
		favourites: "Избранное",
	},

	all: "Все хранилища",
	latest: "Последние",
	addNew: "Добавить новые учетные данные",
	search: "Поиск",
	recents: "Недавние",
	categories: "Категории",
	tabs: {
		home: "Главная",
		add: "Добавить",
		generator: "Генератор",
		profile: "Профиль",
	},
	types: {
		logins: "Логины",
		pins: "PIN-коды",
		creditdebitcards: "Кредитные/дебетовые карты",
		notes: "Заметки",
		contacts: "Контакты",
		bankaccounts: "Банковские счета",
		digitalwallets: "Цифровые кошельки",
		sshkeys: "SSH-ключи",
		apicredentials: "API-учетные данные",
		databases: "Базы данных",
	},
} satisfies BaseTranslation;

export default ru;
