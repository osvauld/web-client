import { loginScript } from "./contents/loginContentScript";
import { postLoginContent } from "./contents/otherContentScript";

import browser from "webextension-polyfill";

// we need to recive message form background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "postCredSubmit") {
		//sendResponse({ response: "Hello from the content script!" });
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
	console.log("calling window onload");
	contentScriptManager();
};

// postLoginContent();
