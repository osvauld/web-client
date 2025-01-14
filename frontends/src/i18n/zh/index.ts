import type { BaseTranslation } from "../i18n-types";

const zh = {
	nav: {
		home: "首页",
		all: "全部",
		personal: "个人",
		work: "工作",
		favourites: "收藏",
	},
	latest: "最新",
	addNew: "添加新凭据",
	search: "搜索",
	all: "全部保险库",
	recents: "最近",
	categories: "类别",
	tabs: {
		home: "首页",
		add: "添加",
		generator: "生成器",
		profile: "个人资料",
	},
	types: {
		logins: "登录",
		pins: "密码",
		creditdebitcards: "信用卡/借记卡",
		notes: "笔记",
		contacts: "联系人",
		bankaccounts: "银行账户",
		digitalwallets: "数字钱包",
		sshkeys: "SSH密钥",
		apicredentials: "API凭证",
		databases: "数据库",
	},
} satisfies BaseTranslation;

export default zh;
