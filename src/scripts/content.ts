import { loginScript } from "./contents/loginContentScript";
import { postLoginContent } from "./contents/postLoginContentInjector";

import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener((message) => {
	if (message.action === "postCredSubmit") {
		postLoginContent(message.data);
	}
});

async function contentScriptManager() {
	let currentUrl = window.location.href;
	if (currentUrl.includes("login")) {
		loginScript();
	}
}

window.onload = () => {
	contentScriptManager();
};

// postLoginContent();
