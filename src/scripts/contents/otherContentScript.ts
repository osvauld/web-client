import browser from "webextension-polyfill";
import { debounce, throttle } from "../helper";

let messageData;

function debouncedMsgToBg(messageData) {
	browser.runtime
		.sendMessage(messageData)
		.then((response) => {
			console.log("Response from background script:", response);
			// Success message to iframe
		})
		.catch((error) => {
			// Failure message to iframe
			console.error("Error sending message to background script:", error);
		});
}

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

function extractPageInfo() {
	let pageTitle = document.title;

	if (!pageTitle) {
		const url = new URL(window.location.href);
		pageTitle = url.hostname.split(".")[1]; // Take the domain name as the title
	}

	// Get the meta description of the webpage, fallback to a generic message if no description
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
			console.log("About to save this data", messageData);
			throttle(debouncedMsgToBg(messageData), 2000);
		}

		if (response.unmount) {
			iframe.remove();
		}
	});
};
