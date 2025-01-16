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
	search: "Поиск",
	recents: "Недавние",
	categories: "Категории",
	addNewCredential: "Добавить новые учетные данные",
	createNewVault: "Создать новое хранилище",
	newVault: "Новое хранилище",
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
