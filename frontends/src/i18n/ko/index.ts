import type { BaseTranslation } from "../i18n-types";

const ko = {
	nav: {
		home: "홈",
		all: "전체",
		personal: "개인",
		work: "업무",
	},
	recents: "최근",
	categories: "카테고리",
	tabs: {
		home: "홈",
		add: "추가",
		generator: "생성기",
		profile: "프로필",
	},
	types: {
		logins: "로그인",
		pins: "핀",
		creditdebitcards: "신용/직불 카드",
		notes: "노트",
		contacts: "연락처",
		bankaccounts: "은행 계좌",
		digitalwallets: "디지털 지갑",
		sshkeys: "SSH 키",
		apicredentials: "API 자격 증명",
		databases: "데이터베이스",
	},
} satisfies BaseTranslation;

export default ko;