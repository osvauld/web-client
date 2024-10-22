export function craftSaveDialouge(username: string, password: string) {
	return `<div id="savePopup" style="position: fixed; top: 10px; right: 10px; background-color: #fff; padding: 10px; border: 1px solid #ccc; z-index: 999;">
      <p>Do you want to save the credentials to osvauld?</p>
      <p>Username: ${username}</p>
      <p>Password: ${password}</p>
      <div style="display: flex; justify-content: space-between;">
      <button id="saveOsvauld" style="background-color: #a6da95; padding: 10px 15px;">Save</button>
      <button id="discardOsvauld" style="background-color: #ed8796; padding: 10px 15px;">Discard</button>
      </div>
    </div> `;
}

export function createSuggestionBox(element: any) {
	let suggestionBox = document.createElement("div");
	suggestionBox.style.position = "absolute";
	suggestionBox.style.left = element.getBoundingClientRect().left + "px";
	suggestionBox.style.top =
		element.getBoundingClientRect().bottom + window.scrollY + "px";
	suggestionBox.style.borderRadius = "5px";
	suggestionBox.style.width = element.offsetWidth + "px";
	suggestionBox.style.zIndex = "1000";
	suggestionBox.style.background = "#181926";
	suggestionBox.style.color = "#fff";
	suggestionBox.classList.add("osvauld");
	suggestionBox.style.fontSize = "16px";
	suggestionBox.style.border = "1px solid #ddd";
	suggestionBox.style.maxHeight = "280px";
	suggestionBox.style.overflowY = "scroll";
	return suggestionBox;
}

export function createSuggestionChildren(username: string) {
	const mappedDiv = document.createElement("div");
	mappedDiv.style.paddingTop = "10px";
	mappedDiv.style.paddingBottom = "10px";
	mappedDiv.style.paddingLeft = "10px";
	mappedDiv.style.borderBottom = "1px solid #6e738d";
	mappedDiv.style.display = "flex";
	mappedDiv.style.justifyContent = "start";
	mappedDiv.style.alignItems = "center";
	mappedDiv.style.cursor = "pointer";
	mappedDiv.style.color = "#b7bdf8";
	mappedDiv.innerText = username;

	return mappedDiv;
}

export function createIcon() {
	let icon = document.createElement("div");
	icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 3v18h18V3"/></svg>`;
	icon.style.position = "absolute";
	icon.style.height = "20px";
	icon.style.width = "20px";
	icon.style.zIndex = "10";
	icon.style.pointerEvents = "none";
	icon.style.cursor = "pointer";
	icon.style.pointerEvents = "auto";
	return icon;
}
