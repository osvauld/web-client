import browser from "webextension-polyfill";
type TypeToClassKey = "reader" | "manager";

export const setbackground = (type: TypeToClassKey): string => {
	const typeToClassMap: Record<TypeToClassKey, string> = {
		reader: "bg-osvauld-readerOrange text-osvauld-readerText",
		manager: "bg-osvauld-managerPurple text-osvauld-managerText",
	};

	return typeToClassMap[type] || "";
};

export const getTokenAndBaseUrl = async () => {
	const [token, baseUrl] = await Promise.all([
		browser.storage.local.get("token"),
		browser.storage.local.get("baseUrl"),
	]);
	return { token: token.token, baseUrl: baseUrl.baseUrl };
};

export const sendMessage = async (action: string, data: any = {}) => {
	const response = await browser.runtime.sendMessage({
		action,
		data,
	});
	return response;
};
export const searchObjects = (query, objects) => {
	const searchResults = [];

	for (const obj of objects) {
		for (const prop in obj) {
			if (
				typeof obj[prop] === "string" &&
				obj[prop].toLowerCase().includes(query.toLowerCase())
			) {
				searchResults.push(obj);
				break;
			}
		}
	}

	return searchResults;
};

export const clickOutside = (node) => {
	const handleClick = (event) => {
		if (node && !node.contains(event.target) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent("clickedOutside", node));
		}
	};

	document.addEventListener("click", handleClick, true);

	return {
		destroy() {
			document.removeEventListener("click", handleClick, true);
		},
	};
};

export const generatePassword = (length: number) => {
	const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
	const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const numberChars = "0123456789";
	const symbolChars = "!@#$%^&*()_";

	const charSet = lowercaseChars + uppercaseChars + numberChars + symbolChars;
	const passwordArray = new Uint8Array(length); // For storing random bytes
	window.crypto.getRandomValues(passwordArray);
	let password = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = passwordArray[i] % charSet.length;
		password += charSet[randomIndex];
	}

	return password;
};
