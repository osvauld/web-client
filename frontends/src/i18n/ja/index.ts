import type { BaseTranslation } from "../i18n-types";

const ja = {
	nav: {
		home: "ホーム",
		all: "すべて",
		personal: "個人",
		work: "仕事",
		favourites: "お気に入り",
	},
	addNew: "新しい資格情報を追加",
	search: "検索",
	all: "すべての保管庫",
	latest: "最新",
	recents: "最近",
	categories: "カテゴリ",
	tabs: {
		home: "ホーム",
		add: "追加",
		generator: "生成器",
		profile: "プロフィール",
	},
	types: {
		logins: "ログイン",
		pins: "PIN",
		creditdebitcards: "クレジット/デビットカード",
		notes: "ノート",
		contacts: "連絡先",
		bankaccounts: "銀行口座",
		digitalwallets: "デジタルウォレット",
		sshkeys: "SSHキー",
		apicredentials: "API認証情報",
		databases: "データベース",
	},
} satisfies BaseTranslation;

export default ja;
