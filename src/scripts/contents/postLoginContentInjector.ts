import browser from "webextension-polyfill";
import { ModifiedEvent } from "../../lib/dtos/event.dto";

interface MessageData {
	action: string;
	data: {
		title: string;
		description: string;
		save: boolean;
		folderId: string;
		username: string;
		password: string;
		domain: string;
	};
}

let messageData: MessageData;

function getExtensionOrigin() {
	const extensionId = browser.runtime.id;

	let protocol: string;

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

function extractPageInfo() {
	let pageTitle = document.title;

	if (!pageTitle) {
		const url = new URL(window.location.href);
		pageTitle = url.hostname.split(".")[1];
	}

	const metaDescriptionElement = document.querySelector(
		'meta[name="description"]',
	);
	let pageDescription = metaDescriptionElement
		? metaDescriptionElement.getAttribute("content")
		: `Login for ${pageTitle}`;

	return {
		title: pageTitle,
		description: pageDescription,
	};
}

export const postLoginContent = (data: ModifiedEvent) => {
	const iframe = document.createElement("iframe");

	iframe.style.position = "fixed";
	iframe.style.top = "20px";
	iframe.style.right = "20px";
	iframe.style.width = "400px";
	iframe.style.height = "240px";
	iframe.style.zIndex = "1000";
	iframe.style.border = "none";
	iframe.style.padding = "20px";
	iframe.style.boxSizing = "border-box";
	iframe.style.backgroundColor = "#0D0E13";
	iframe.src = `${browser.runtime.getURL("suggestions.html")}`;
	iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
	document.body.appendChild(iframe);

	iframe.onload = () => {
		iframe.contentWindow?.postMessage(
			data,
			`${browser.runtime.getURL("suggestions.html")}`,
		);
	};

	window.addEventListener("message", (event) => {
		if (event.origin !== getExtensionOrigin()) {
			return;
		}

		const { save, ...response } = event.data;
		const pageInfo = extractPageInfo();

		messageData = {
			action: "saveCapturedCredentialToFolder",
			data: {
				title: pageInfo.title,
				description: pageInfo.description,
				...response,
			},
		};

		if (save) {
			browser.runtime
				.sendMessage(messageData)
				.then((response) => {
					iframe.contentWindow?.postMessage(
						{ confirmation: true, id: "osvauld", ...response },
						`${browser.runtime.getURL("suggestions.html")}`,
					);
				})
				.catch((error) => {
					console.error("Error sending message to background script:", error);
				});
		}

		if (response.unmount) {
			iframe.remove();
		}
	});
};
