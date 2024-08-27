import browser from "webextension-polyfill";

function getExtensionOrigin() {
	const extensionId = browser.runtime.id;

	let protocol;

	if (
		typeof browser !== "undefined" &&
		browser.runtime &&
		browser.runtime.getURL("").startsWith("moz-extension://")
	) {
		protocol = "moz-extension";
	} else if (
		typeof browser !== "undefined" &&
		browser.runtime &&
		browser.runtime.getURL("").startsWith("chrome-extension://")
	) {
		protocol = "chrome-extension";
	} else {
		protocol = "chrome-extension";
	}

	const extensionOrigin = `${protocol}://${extensionId}`;

	return extensionOrigin;
}

export const postLoginContent = (data) => {
	const iframe = document.createElement("iframe");

	iframe.style.position = "fixed";
	iframe.style.top = "20px";
	iframe.style.right = "20px";
	iframe.style.width = "400px";
	iframe.style.height = "240px";
	iframe.style.zIndex = "1000";
	iframe.style.border = "none";
	iframe.style.padding = "20px";
	iframe.style.backgroundColor = "#0D0E13";
	iframe.src = `${browser.runtime.getURL("suggestions.html")}`;
	document.body.appendChild(iframe);

	iframe.onload = () => {
		// Receive the data here
		console.log("Relevant data other contentscript", data);
		const message = { username: "tonyantony300", id: "osvauld" };
		iframe.contentWindow?.postMessage(
			message,
			`${browser.runtime.getURL("suggestions.html")}`,
		);
	};

	window.addEventListener("message", (event) => {
		if (event.origin !== getExtensionOrigin()) {
			return;
		}

		// Process the response from the iframe
		const response = event.data;
		if (response.success) {
			// Now go ahead and display the next screen where folders will be listed;
			console.log("Folders will be shown now.");
			// Send pass on the data along with the folderId to backend
			// Send data to DB and if sucessfull
			// Communicate the same down to iframe for final window
			// Do remove the iframe
		} else {
			iframe.remove();
		}
	});
};
