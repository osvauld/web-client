import browser from "webextension-polyfill";

export const postLoginContent = (data) => {
	console.log("Injecting iframe for Svelte component");

	// Create iframe
	const iframe = document.createElement("iframe");
	iframe.style.position = "fixed";
	iframe.style.top = "20px";
	iframe.style.right = "20px";
	iframe.style.width = "400px";
	iframe.style.height = "15rem";
	iframe.style.zIndex = "1000";
	iframe.style.border = "none";
	iframe.style.padding = "20px";
	iframe.style.backgroundColor = "#0D0E13";
	iframe.src = `${browser.runtime.getURL("suggestions.html")}`;
	// Append the iframe to the body
	document.body.appendChild(iframe);

	// // Example of sending data to the iframe
	// iframe.onload = () => {
	// 	const message = { username: "tonyantony300", password: "**********" };
	// 	iframe.contentWindow?.postMessage(message, "*");
	// };
};
