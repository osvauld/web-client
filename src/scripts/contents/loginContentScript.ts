// import browser from "webextension-polyfill";

// export const loginScript = () => {

// 	const forms = document.querySelectorAll<HTMLFormElement>("form");

// 	if (forms.length > 0) {
// 		forms.forEach((form) => {
// 			form.addEventListener("submit", function () {
// 				const username = form.querySelector<HTMLInputElement>(
// 					'input[type="text"], input[type="email"]',
// 				)?.value;

// 				const password = form.querySelector<HTMLInputElement>(
// 					'input[type="password"]',
// 				)?.value;

// 				if (username && password) {
// 					// Send message to the background script

// 					browser.runtime.sendMessage({
// 						action: "credentialSubmit",
// 						data: { username, password },
// 					});
// 				}
// 			});
// 		});
// 	}

// };

// Improved Login Form Detection Script
import browser from "webextension-polyfill";

export const improvedLoginDetection = (): void => {
	// Function to detect login forms based on advanced heuristics
	function detectLoginForms(): void {
		const forms = document.querySelectorAll("form");

		forms.forEach((form) => {
			if (isLoginForm(form)) {
				console.log("Login form detected:", form);
				attachFormListener(form);
			}
		});
	}

	// Function to determine if a form is a login form
	function isLoginForm(form: HTMLFormElement): boolean {
		const inputs = form.querySelectorAll("input");
		let hasUsernameField = false;
		let hasPasswordField = false;

		inputs.forEach((input) => {
			if (isPasswordField(input)) {
				hasPasswordField = true;
			} else if (isUsernameField(input)) {
				hasUsernameField = true;
			}
		});

		return hasPasswordField && (hasUsernameField || hasLoginIndicators(form));
	}

	// Function to check if an input is a password field
	function isPasswordField(input: HTMLInputElement): boolean {
		return (
			input.type === "password" ||
			input.name.toLowerCase().includes("password") ||
			input.id.toLowerCase().includes("password") ||
			input.getAttribute("autocomplete") === "current-password"
		);
	}

	// Function to check if an input is a username field
	function isUsernameField(input: HTMLInputElement): boolean {
		const inputProps = [
			input.type,
			input.name,
			input.id,
			input.getAttribute("autocomplete") ?? "",
		].map((prop) => prop.toLowerCase());
		const usernameKeywords = [
			"text",
			"email",
			"tel",
			"user",
			"login",
			"signin",
			"username",
			"email",
		];
		return inputProps.some((prop) =>
			usernameKeywords.some((keyword) => prop.includes(keyword)),
		);
	}

	// Function to check for additional login indicators
	function hasLoginIndicators(form: HTMLFormElement): boolean {
		// Check for login-related text in buttons
		const buttons = form.querySelectorAll('button, input[type="submit"]');
		const hasLoginButton = Array.from(buttons).some((button) => {
			const buttonElement = button as HTMLButtonElement | HTMLInputElement;
			return [
				"log in",
				"sign in",
				"login",
				"signin",
				"submit",
				"continue",
				"next",
			].some(
				(text) =>
					buttonElement.textContent?.toLowerCase().includes(text) ?? false,
			);
		});

		// Check form attributes
		const formAttrs = [form.action, form.method, form.className, form.id].map(
			(attr) => attr.toLowerCase(),
		);
		const loginKeywords = ["login", "signin", "auth", "session", "token"];
		const hasLoginAttr = formAttrs.some((attr) =>
			loginKeywords.some((keyword) => attr.includes(keyword)),
		);

		return (
			hasLoginButton || hasLoginAttr || form.method.toLowerCase() === "post"
		);
	}

	// Function to attach event listener to the form
	function attachFormListener(form: HTMLFormElement): void {
		form.addEventListener("submit", (event) => {
			event.preventDefault();
			console.log("Login attempt detected at =>> ", window.location.href);
			form.submit();

			// 	browser.runtime.sendMessage({
			// 		action: "loginAttempt",
			// 		url: window.location.href
			// 	}
			// ).then(() => {
			//	form.submit();
			// 	}).catch((error) => {
			// 		console.error("Error notifying background script:", error);
			// 		form.submit();
			// 	});
		});
	}

	// Run detection when the script is executed
	detectLoginForms();

	// Set up MutationObserver to handle dynamically loaded forms
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			if (mutation.type === "childList") {
				mutation.addedNodes.forEach((node) => {
					if (node instanceof HTMLElement) {
						if (node.matches("form")) {
							if (isLoginForm(node as HTMLFormElement)) {
								console.log("Dynamically added login form detected:", node);
								attachFormListener(node as HTMLFormElement);
							}
						} else {
							const forms = node.querySelectorAll("form");
							forms.forEach((form) => {
								if (isLoginForm(form)) {
									console.log("Dynamically added login form detected:", form);
									attachFormListener(form);
								}
							});
						}
					}
				});
			}
		});
	});

	observer.observe(document.body, { childList: true, subtree: true });
};

// Execute the improved login detection
