import { improvedLoginDetection } from "./contents/loginContentScript";
import { postLoginContent } from "./contents/postLoginContentInjector";

import { browser } from "../utils/browserApi";

browser.runtime.onMessage.addListener((message) => {
	if (message.action === "postCredSubmit") {
		postLoginContent(message.data);
	}
});

window.onload = () => {
	improvedLoginDetection();
};
