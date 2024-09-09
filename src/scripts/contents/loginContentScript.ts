import browser from "webextension-polyfill";

export const loginScript = () => {
	// earlier script do here
	// const currentURL = window.location.href;
	// let usernameElem= document.evaluate(
	//     "(//form//input[   @type='email' or contains(@name, 'username')   or contains(@id, 'email')   or contains(@id, 'username')   or contains(@placeholder, 'Email')   or contains(@placeholder, 'Username')   or contains(ancestor::label, 'Email')   or contains(ancestor::label, 'Username')   or contains(@class, 'email')   or contains(@class, 'username')   or @aria-label='Email'   or @aria-label='Username'   or @aria-labelledby='Email'   or @aria-labelledby='Username' ] | //input[@type='text'])[1]",
	//     document,
	//     null,
	//     XPathResult.FIRST_ORDERED_NODE_TYPE,
	//     null
	//   ).singleNodeValue;

	// let passwordElem = document.evaluate(
	//     "(//form//input[ @type='password'or contains(@name, 'password')or contains(@id, 'password')or contains(@placeholder, 'Password')or contains(ancestor::label, 'Password')or contains(@class, 'password')or @aria-label='Password'or @aria-labelledby='Password'] | //input[@type='password'])[1]",
	//     document,
	//     null,
	//     XPathResult.FIRST_ORDERED_NODE_TYPE,
	//     null
	//   ).singleNodeValue;

	const forms = document.querySelectorAll<HTMLFormElement>("form");

	if (forms.length > 0) {
		forms.forEach((form) => {
			form.addEventListener("submit", function () {
				const username = form.querySelector<HTMLInputElement>(
					'input[type="text"], input[type="email"]',
				)?.value;

				const password = form.querySelector<HTMLInputElement>(
					'input[type="password"]',
				)?.value;

				if (username && password) {
					// Send message to the background script

					browser.runtime.sendMessage({
						action: "credentialSubmit",
						data: { username, password },
					});
				}
			});
		});
	}

	// Send username and password to backend

	// At backend wait for 3 seconds
	// if the url doesn't have login anymore, active the second script
};
