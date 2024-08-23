// export const postLoginContent = () => {
// 	console.log("other content scripts loaded");

// 	// Create main div
// 	const infoDiv = document.createElement("div");
// 	infoDiv.style.position = "fixed";
// 	infoDiv.style.top = "20px";
// 	infoDiv.style.right = "20px";
// 	infoDiv.style.width = "400px";
// 	infoDiv.style.height = "300px";
// 	infoDiv.style.backgroundColor = "black";
// 	infoDiv.style.color = "white";
// 	infoDiv.style.display = "flex";
// 	infoDiv.style.flexDirection = "column";
// 	infoDiv.style.padding = "20px";
// 	infoDiv.style.justifyContent = "space-between";
// 	infoDiv.style.zIndex = "1000";
// 	infoDiv.style.border = "2px solid white";
// 	infoDiv.style.boxSizing = "border-box";

// 	// Create title
// 	const title = document.createElement("div");
// 	title.textContent = "OSVAULD";
// 	title.style.fontSize = "32px";
// 	title.style.fontWeight = "bold";
// 	title.style.marginBottom = "10px";

// 	// Create message
// 	const message = document.createElement("div");
// 	message.textContent = "Would you like to save this Credential?";
// 	message.style.marginBottom = "10px";

// 	// Create username display
// 	const usernameDisplay = document.createElement("div");
// 	usernameDisplay.textContent = "username: tonyantony300";
// 	title.style.fontSize = "16px";
// 	usernameDisplay.style.marginBottom = "5px";

// 	// Create password display
// 	const passwordDisplay = document.createElement("div");
// 	passwordDisplay.textContent = "password: **********";
// 	passwordDisplay.style.fontSize = "16px";
// 	passwordDisplay.style.marginBottom = "15px";

// 	// Create button container
// 	const buttonContainer = document.createElement("div");
// 	buttonContainer.style.display = "flex";
// 	buttonContainer.style.justifyContent = "space-between";

// 	// Create "Later" button
// 	const laterButton = document.createElement("button");
// 	laterButton.textContent = "Later";
// 	laterButton.style.backgroundColor = "red";
// 	laterButton.style.color = "white";
// 	laterButton.style.border = "none";
// 	laterButton.style.padding = "10px";
// 	laterButton.style.cursor = "pointer";

// 	// Create "Save" button
// 	const saveButton = document.createElement("button");
// 	saveButton.textContent = "Save";
// 	saveButton.style.backgroundColor = "green";
// 	saveButton.style.color = "white";
// 	saveButton.style.border = "none";
// 	saveButton.style.padding = "10px";
// 	saveButton.style.cursor = "pointer";

// 	// Append buttons to container
// 	buttonContainer.appendChild(laterButton);
// 	buttonContainer.appendChild(saveButton);

// 	// Append all elements to main div
// 	infoDiv.appendChild(title);
// 	infoDiv.appendChild(message);
// 	infoDiv.appendChild(usernameDisplay);
// 	infoDiv.appendChild(passwordDisplay);
// 	infoDiv.appendChild(buttonContainer);

// 	// Append the div to the body
// 	document.body.appendChild(infoDiv);
// };

export const postLoginContent = (data) => {
	console.log("Injecting iframe for Svelte component");

	// Create iframe
	const iframe = document.createElement("iframe");
	iframe.style.position = "fixed";
	iframe.style.top = "20px";
	iframe.style.right = "20px";
	iframe.style.width = "400px";
	iframe.style.height = "300px";
	iframe.style.zIndex = "1000";
	iframe.style.border = "none";
	iframe.style.backgroundColor = "black";
	// Append the iframe to the body
	document.body.appendChild(iframe);

	// Write the initial content of the iframe (HTML, head, body)
	const iframeDocument =
		iframe.contentDocument || iframe.contentWindow?.document;
	if (iframeDocument) {
		iframeDocument.open();
		iframeDocument.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
      </head>
      <body>
        <script src="build/suggestions.js"></script> 
      </body>
      </html>
    `);
		iframeDocument.close();
	}

	// // Example of sending data to the iframe
	// iframe.onload = () => {
	// 	const message = { username: "tonyantony300", password: "**********" };
	// 	iframe.contentWindow?.postMessage(message, "*");
	// };
};
