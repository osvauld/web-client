import browser from "webextension-polyfill";
export const improvedLoginDetection = (): void => {
	const loginKeywords = [
		"log in",
		"sign in",
		"login",
		"signin",
		"next",
		"continue",
		"submit",
	];

	function isPasswordField(input: HTMLInputElement): boolean {
		return (
			input.type === "password" ||
			input.name.toLowerCase().includes("password") ||
			input.id.toLowerCase().includes("password") ||
			input.getAttribute("autocomplete") === "current-password" ||
			input.placeholder.toLowerCase().includes("password")
		);
	}

	function isUsernameField(input: HTMLInputElement): boolean {
		const inputProps = [
			input.type,
			input.name,
			input.id,
			input.getAttribute("autocomplete") ?? "",
			input.placeholder,
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
			"account",
		];
		return inputProps.some((prop) =>
			usernameKeywords.some((keyword) => prop.includes(keyword)),
		);
	}

	function hasLoginIndicators(container: HTMLElement): boolean {
		const buttonText = Array.from(
			container.querySelectorAll(
				'button, input[type="submit"], input[type="button"]',
			),
		)
			.map(
				(el) =>
					(el instanceof HTMLInputElement ? el.value : el.textContent) || "",
			)
			.join(" ")
			.toLowerCase();

		const hasLoginButton = loginKeywords.some((keyword) =>
			buttonText.includes(keyword),
		);

		const containerAttrs = [
			container.className,
			container.id,
			container.getAttribute("role") ?? "",
		].map((attr) => attr.toLowerCase());
		const loginAttrKeywords = ["login", "signin", "auth", "session", "token"];
		const hasLoginAttr = containerAttrs.some((attr) =>
			loginAttrKeywords.some((keyword) => attr.includes(keyword)),
		);

		return hasLoginButton || hasLoginAttr;
	}

	function getCredentialFields(container: HTMLElement): {
		usernameInput: HTMLInputElement | null;
		passwordInput: HTMLInputElement | null;
	} {
		const inputs = Array.from(container.querySelectorAll("input"));
		const passwordInput = inputs.find(
			isPasswordField,
		) as HTMLInputElement | null;
		let usernameInput: HTMLInputElement | null = null;

		if (passwordInput) {
			const passwordIndex = inputs.indexOf(passwordInput);
			usernameInput = inputs
				.slice(0, passwordIndex)
				.reverse()
				.find(isUsernameField) as HTMLInputElement | null;
		}

		if (!usernameInput) {
			usernameInput = inputs.find(isUsernameField) as HTMLInputElement | null;
		}

		return { usernameInput, passwordInput };
	}

	async function credentialCaptureHandler(
		username: string,
		password: string,
	): Promise<void> {
		console.log("credentialCaptureHandler triggered");
		if (username && password) {
			try {
				await browser.runtime.sendMessage({
					action: "credentialSubmit",
					data: { username, password, url: window.location.href },
				});
				console.log("Credentials captured successfully", username, password);
			} catch (error) {
				console.error("Error capturing credentials:", error);
			}
		}
	}

	function attachLoginListener(container: HTMLElement): void {
		const { usernameInput, passwordInput } = getCredentialFields(container);
		if (usernameInput && passwordInput) {
			const handler = () =>
				credentialCaptureHandler(usernameInput.value, passwordInput.value);

			if (container instanceof HTMLFormElement) {
				container.addEventListener(
					"submit",
					async (event) => {
						event.preventDefault();
						await handler();
						container.submit();
					},
					{ once: true },
				);
			}
			const loginButtons = Array.from(
				container.querySelectorAll(
					'button, input[type="submit"], input[type="button"]',
				),
			).filter((button) => {
				const buttonText =
					(button instanceof HTMLInputElement
						? button.value
						: button.textContent) || "";
				return loginKeywords.some((keyword) =>
					buttonText.toLowerCase().includes(keyword),
				);
			});

			loginButtons.forEach((button) => {
				button.addEventListener("click", handler, { once: true });
			});
		}
	}

	function detectLoginForms(): void {
		const potentialContainers = [
			...document.querySelectorAll("form"),
			...document.querySelectorAll(
				"div[class*='login'], div[class*='signin'], div[id*='form']",
			),
		];

		potentialContainers.forEach((container) => {
			if (
				container instanceof HTMLElement &&
				(container instanceof HTMLFormElement || hasLoginIndicators(container))
			) {
				console.log("Login container detected:", container);
				attachLoginListener(container);
			}
		});
	}

	function initializeMutationObserver(): void {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === "childList") {
					mutation.addedNodes.forEach((node) => {
						if (node instanceof HTMLElement) {
							if (node instanceof HTMLFormElement || hasLoginIndicators(node)) {
								console.log(
									"Dynamically added login container detected:",
									node,
								);
								attachLoginListener(node);
							} else {
								const containers = node.querySelectorAll(
									"form, div[class*='login'], div[class*='signin'], div[id*='form']",
								);
								containers.forEach((container) => {
									if (
										container instanceof HTMLElement &&
										(container instanceof HTMLFormElement ||
											hasLoginIndicators(container))
									) {
										console.log(
											"Dynamically added login container detected:",
											container,
										);
										attachLoginListener(container);
									}
								});
							}
						}
					});
				}
			});
		});

		if (document.body) {
			observer.observe(document.body, { childList: true, subtree: true });
		} else {
			console.warn(
				"Document body not available, MutationObserver not initialized",
			);
		}
	}

	function onDOMReady(callback: () => void): void {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", callback);
		} else {
			callback();
		}
	}

	function main(): void {
		detectLoginForms();
		initializeMutationObserver();
	}

	onDOMReady(main);
};

improvedLoginDetection();
