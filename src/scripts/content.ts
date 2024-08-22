import { loginScript } from "./contents/loginContentScript";
import { postLoginContent } from "./contents/otherContentScript";

async function contentScriptManager() {
	let currentUrl = window.location.href;
	if (currentUrl.includes("login")) {
		loginScript();
	}
}

window.onload = () => {
	contentScriptManager();
};
