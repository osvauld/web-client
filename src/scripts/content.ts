import browser from "webextension-polyfill";
import { craftSaveDialouge, createIcon, createSuggestionBox, createSuggestionChildren } from "../lib/components/content/nodeGenerators";
import { getElement } from "../lib/components/content/xpaths"

let count = 0;
let creds: any = [];

function showSavePopup(username: string, password: string) {
  let popup = document.createElement("div");
  popup.innerHTML = craftSaveDialouge(username, password);

  document.body.appendChild(popup);

  let saveButton = document.getElementById("saveOsvauld");
  saveButton?.addEventListener("click", function () {
    console.log("User chose to save credentials to osvauld.");
    popup.remove();
  });


  let discardButton = document.getElementById("discardOsvauld");
  discardButton?.addEventListener("click", function () {
    console.log("User chose not to save credentials to osvauld.");
    popup.remove();
  });
}


const fillCredentials = (arg1: string, arg2: string) => {

  let box: Element | null = document.querySelector(".osvauld");

  let usernameElem = getElement("username");
  if (usernameElem instanceof HTMLInputElement) {
    usernameElem.value = arg1;
    usernameElem.dispatchEvent(new Event('input', { bubbles: true }));
    box?.remove();
  }

  let passwordElem = getElement("password");
  if (passwordElem instanceof HTMLInputElement) {
    passwordElem.value = arg2;
    passwordElem.dispatchEvent(new Event('input', { bubbles: true }));
    box?.remove();
  }

};


window.addEventListener('resize', () => {
  let box: Element | null = document.querySelector(".osvauld");
  if (box) {
    count++
    box.remove();
  }
})

function suggestionsDialouge(element: HTMLInputElement, count: number) {
  if (count % 2 === 0) {
    let box: Element | null = document.querySelector(".osvauld");
    box instanceof Element ? box?.remove() : undefined;
  } else {
    let suggestionBox = createSuggestionBox(element)
    document.body.appendChild(suggestionBox);
    creds
      .map((item) => {
        let mappedDiv = createSuggestionChildren(item.username);
        mappedDiv.addEventListener("click", async () => {
          const userDetails = await browser.runtime.sendMessage({ action: 'getActiveCredSuggestion', data: item.id })
          fillCredentials(userDetails.username, userDetails.password);
        });
        return mappedDiv;
      })
      .forEach((div) => suggestionBox.appendChild(div));
  }
}

function appendIcon(element: HTMLInputElement) {

  let icon = createIcon();

  icon.addEventListener("click", function (event) {
    event.stopPropagation();
    count++;
    suggestionsDialouge(element, count);
  });

  let rect = element.getBoundingClientRect();
  icon.style.top = `${rect.top + window.scrollY + (element.offsetHeight - 25) / 2
    }px`;
  icon.style.left = `${rect.left + window.scrollX + element.offsetWidth - 35
    }px`;

  document.body.appendChild(icon);
  window.addEventListener("scroll", () => {
    let rect = element.getBoundingClientRect();
    icon.style.top = `${rect.top + window.scrollY + (element.offsetHeight - 25) / 2
      }px`;
    icon.style.left = `${rect.left + window.scrollX + element.offsetWidth - 35
      }px`;
  });

  window.addEventListener("resize", () => {
    let rect = element.getBoundingClientRect();
    icon.style.top = `${rect.top + window.scrollY + (element.offsetHeight - 25) / 2
      }px`;
    icon.style.left = `${rect.left + window.scrollX + element.offsetWidth - 35
      }px`;
  });
}

try {
  let usernameElem = getElement('username');
  if (usernameElem instanceof HTMLInputElement) {
    appendIcon(usernameElem);
  }
} catch (e) {
  console.log("username field xpath failed");
}

browser.runtime.onMessage.addListener(function (request) {
  if (request.action === "fillingSignal") {
    let usernameElem = getElement('username');

    if (usernameElem instanceof HTMLInputElement) {
      usernameElem.value = request?.body[0];
    }

    let passwordElem = getElement('password');

    if (passwordElem instanceof HTMLInputElement) {
      passwordElem.value = request?.body[1];
    }
  }

  if (request.action === "saveToVault") {

    showSavePopup(request.username, request.password);
  }

  if (request.action === "updateCredsList") {
    console.log('update creds list', request.creds)
    creds = request.creds;
  }


});


function getLoginCredentials() {
  let usernameElem = getElement("username");
  let passwordElem = getElement("password");


  if (usernameElem && passwordElem) {
    let usernameValue = (usernameElem as HTMLInputElement).value;
    let passwordValue = (passwordElem as HTMLInputElement).value;

    if (usernameValue.length > 3 && passwordValue.length > 3) {
      (async () => {

        await browser.runtime.sendMessage({ action: 'credSubmitted', url: location.href, username: usernameValue, password: passwordValue })
      })()
    }

  } else {
    console.log("Username or password element not found.");
  }
}

let loginButtonElem = getElement("login");
if (loginButtonElem) {

  loginButtonElem.addEventListener("click", getLoginCredentials);
} else {
  console.log("Login button not found.");
}


// browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.event === "updateCreds") {
//     // creds = message.data;
//     console.log(creds, "FFFFFFFFFFFFFFFFFFFFFFFF");
//     // Update your state here
//   }
// });