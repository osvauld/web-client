import browser from "webextension-polyfill";

const list = [
  { username: "steve@marvel.com", password: "captain@america" },
  { username: "natashaaa@marvel.com", password: "blackwidow@123" },
  { username: "bruce@marvel.com", password: "hulk123" },
  { username: "clint@marvel.com", password: "hawkeye@123" },
  { username: "thor@marvel.com", password: "godofthunder123" },
  { username: "wanda@marvel.com", password: "scarletwitch@123" },
  { username: "peter@marvel.com", password: "spiderman@123" },
  { username: "logan@marvel.com", password: "wolverine123" },
  { username: "ororo@marvel.com", password: "storm@123" },
  { username: "scott@marvel.com", password: "cyclops123" },
  { username: "jean@marvel.com", password: "phoenix@123" },
  { username: "rhodey@marvel.com", password: "war_machine@123" },
  { username: "vision@marvel.com", password: "synthezoid123" },
  { username: "peterq@marvel.com", password: "starlord@123" },
  { username: "groot@marvel.com", password: "iamgroot123" },
  { username: "rocket@marvel.com", password: "rocketraccoon@123" },
  { username: "gamora@marvel.com", password: "deadliestwoman123" },
  { username: "drax@marvel.com", password: "thedestroyer@123" },
  { username: "mantis@marvel.com", password: "celestialbeing@123" },
  { username: "nick@marvel.com", password: "fury123" },
];

let count = 0;


let usernameExp = "(//form//input[   @type='email' or contains(@name, 'username')   or contains(@id, 'email')   or contains(@id, 'username')   or contains(@placeholder, 'Email')   or contains(@placeholder, 'Username')   or contains(ancestor::label, 'Email')   or contains(ancestor::label, 'Username')   or contains(@class, 'email')   or contains(@class, 'username')   or @aria-label='Email'   or @aria-label='Username'   or @aria-labelledby='Email'   or @aria-labelledby='Username' ] | //input[@type='text'])[1]";

let passwordExp = "(//form//input[ @type='password'or contains(@name, 'password')or contains(@id, 'password')or contains(@placeholder, 'Password')or contains(ancestor::label, 'Password')or contains(@class, 'password')or @aria-label='Password'or @aria-labelledby='Password'] | //input[@type='password'])[1]";


let loginButtonExp = "(//button[contains(@type, 'submit') or contains(@id, 'login') or contains(@name, 'login') or contains(@value, 'login') or contains(@class, 'login') or contains(text(), 'Login') or contains(text(), 'Log In') or @aria-label='Login' or @aria-label='Log In' or @aria-labelledby='Login' or @aria-labelledby='Log In'] | //input[@type='submit'])[1]";



function getElement(name: string){

  if(name === 'username'){
    let usernameElem: Element | null = document.evaluate(usernameExp,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as Element | null;
    return usernameElem
  } else if(name === "password"){
    let passwordElem: Element | null = document.evaluate(
      passwordExp,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as Element | null;
    return passwordElem;
  } else if(name === "login"){
    let loginButtonElem = document.evaluate(
      loginButtonExp,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as Element | null;
   return loginButtonElem;
  }
  
}

const fillData = (arg1: string, arg2: string) => {

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
  if(box){
    count++
    box.remove();
  }
})

function suggestionsDialouge(element: HTMLInputElement, count: number) {
  if (count % 2 === 0) {
    let box: Element | null = document.querySelector(".osvauld");
    box instanceof Element ? box?.remove() : undefined;
  } else {
    let suggestionBox = document.createElement("div");
    suggestionBox.style.position = "absolute";
    suggestionBox.style.left = element.getBoundingClientRect().left + "px";
    suggestionBox.style.top =
      element.getBoundingClientRect().bottom + window.scrollY + "px";
    suggestionBox.style.borderRadius = "5px";
    suggestionBox.style.width = element.offsetWidth + "px";
    suggestionBox.style.zIndex = "1000"; // To ensure it's above other elements
    suggestionBox.style.background = "#181926";
    suggestionBox.style.color = "#fff";
    suggestionBox.classList.add("osvauld");
    suggestionBox.style.fontSize = "16px";
    suggestionBox.style.border = "1px solid #ddd";
    suggestionBox.style.maxHeight = "280px";
    suggestionBox.style.overflowY = "scroll";
    document.body.appendChild(suggestionBox);
    list
      .map((item) => {
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
        mappedDiv.innerText = item.username;

        mappedDiv.addEventListener("click", () => {
          fillData(item.username, item.password);
        });
        return mappedDiv;
      })
      .forEach((div) => suggestionBox.appendChild(div));
  }
}

function appendIcon(element: HTMLInputElement) {
  let icon = document.createElement("div");
  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 3v18h18V3"/></svg>`;
  icon.style.position = "absolute";
  icon.style.height = "20px";
  icon.style.width = "20px";
  icon.style.zIndex = "10";
  icon.style.pointerEvents = "none";
  icon.style.cursor = "pointer";
  icon.style.pointerEvents = "auto";

  icon.addEventListener("click", function (event) {
    event.stopPropagation();
    count++;
    suggestionsDialouge(element, count);
  });

  let rect = element.getBoundingClientRect();
  icon.style.top = `${
    rect.top + window.scrollY + (element.offsetHeight - 25) / 2
  }px`;
  icon.style.left = `${
    rect.left + window.scrollX + element.offsetWidth - 35
  }px`;
  document.body.appendChild(icon);
  window.addEventListener("scroll", () => {
    let rect = element.getBoundingClientRect();
    icon.style.top = `${
      rect.top + window.scrollY + (element.offsetHeight - 25) / 2
    }px`;
    icon.style.left = `${
      rect.left + window.scrollX + element.offsetWidth - 35
    }px`;
  });

  window.addEventListener("resize", () => {
    let rect = element.getBoundingClientRect();
    icon.style.top = `${
      rect.top + window.scrollY + (element.offsetHeight - 25) / 2
    }px`;
    icon.style.left = `${
      rect.left + window.scrollX + element.offsetWidth - 35
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
    console.log("Message received in content script:", request.body);

    let usernameElem = getElement('username');

    if (usernameElem instanceof HTMLInputElement) {
      usernameElem.value = request?.body[0];
    }

    let passwordElem = getElement('password');

    if (passwordElem instanceof HTMLInputElement) {
      passwordElem.value = request?.body[1];
    }
  }
});

//This content script is injected on to every page for now.
//newly added username and password needs to be saved into osvauld after prompting with a small popup asking whenther they need to save this.

//display username and password into console
//How am I going to capture the credential?
//What algoritham should I use to identify customer entered username and next page is successfully rendered?

// Initial point should be identifying "Login button"

// Function to show the save popup
function showSavePopup() {
  let popup = document.createElement("div");
  popup.innerHTML = `
    <div id="savePopup" style="position: fixed; top: 10px; left: 10px; background-color: #fff; padding: 10px; border: 1px solid #ccc;">
      <p>Do you want to save the credentials to osvauld?</p>
      <button id="saveButton">Save</button>
    </div>
  `;

  document.body.appendChild(popup);

  // Add event listener for the save button
  let saveButton = document.getElementById("saveButton");
  saveButton?.addEventListener("click", function () {
    console.log("User chose to save credentials to osvauld.");
    // Implement the logic to save credentials to osvauld
    // ...

    // Remove the popup
    popup.remove();
  });
}


// function hasPathChanged(currentUrl: string) {

//   const extractPathname = (url: string) => {
//     const urlObject = new URL(url);
//     return urlObject.pathname;
//   };

//   const initialPath = extractPathname(initialUrl);
//   const currentPath = extractPathname(currentUrl);

//   return initialPath && currentPath && initialPath !== currentPath;
// }


function getLoginCredentials() {
  // Find username and password elements
  console.log('Login button is clicked, getting credentials');
  let usernameElem = getElement("username");

  let passwordElem = getElement("password");

  // Check if username and password elements exist
  if (usernameElem && passwordElem) {
    // Get values entered in the username and password fields
    let usernameValue = (usernameElem as HTMLInputElement).value;
    let passwordValue = (passwordElem as HTMLInputElement).value;

    // Display values in the console
    console.log("Username: ", usernameValue);
    console.log("Password: ", passwordValue);

    // So now we have the username and password.
    // How can we identify it is the correct username and passowrd?
    // Once the username and password is obtained, wait for 5 seconds or with one check at 1 second 2 second last one at 5 second. At each Interval get url. If the url subdomain is changed, it means we are in and the credentials user enterd were indeed right.
    // Once determined those were right, need to prompt with a popup on the left top corner of the screen, fixed at one corner asking us to save the credentials to osvauld. If user choses to click save, console that user chosed to save and if not nothing happens and popup goes away
   
    (async() => {
      await browser.runtime.sendMessage({action: 'credSubmitted', url: location.href})
      // content.js

      browser.runtime.onMessage.addListener((message) => {
        if (message.action === "responding") {
          console.log("Received responding message in content script!");
        }
      });

      //Abve should be made on top
    })()

  } else {
    console.log("Username or password element not found.");
  }
}

// Find the login button element
let loginButtonElem = getElement("login");

// Attach click event listener to the login button
if (loginButtonElem) {
  loginButtonElem.addEventListener("click", getLoginCredentials);
} else {
  console.log("Login button not found.");
}