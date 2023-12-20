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

let count= 0;

function fillData(arg1: string, arg2:string) {
  let usernameElem: Element | null = document.evaluate(
    "(//form//input[   @type='email' or contains(@name, 'username')   or contains(@id, 'email')   or contains(@id, 'username')   or contains(@placeholder, 'Email')   or contains(@placeholder, 'Username')   or contains(ancestor::label, 'Email')   or contains(ancestor::label, 'Username')   or contains(@class, 'email')   or contains(@class, 'username')   or @aria-label='Email'   or @aria-label='Username'   or @aria-labelledby='Email'   or @aria-labelledby='Username' ] | //input[@type='text'])[1]",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue as Element | null ; 

  if(usernameElem instanceof HTMLInputElement){
    usernameElem.value = arg1;
  }

  let passwordElem: Element | null = document.evaluate(
    "(//form//input[ @type='password'or contains(@name, 'password')or contains(@id, 'password')or contains(@placeholder, 'Password')or contains(ancestor::label, 'Password')or contains(@class, 'password')or @aria-label='Password'or @aria-labelledby='Password'] | //input[@type='password'])[1]",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue as Element | null ; 

  if(passwordElem instanceof HTMLInputElement){
    passwordElem.value = arg2;
  }

}

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
  let usernameElem: Element | null = document.evaluate(
    "(//form//input[   @type='email' or contains(@name, 'username')   or contains(@id, 'email')   or contains(@id, 'username')   or contains(@placeholder, 'Email')   or contains(@placeholder, 'Username')   or contains(ancestor::label, 'Email')   or contains(ancestor::label, 'Username')   or contains(@class, 'email')   or contains(@class, 'username')   or @aria-label='Email'   or @aria-label='Username'   or @aria-labelledby='Email'   or @aria-labelledby='Username' ] | //input[@type='text'])[1]",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue as Element | null;
  if(usernameElem instanceof HTMLInputElement){
    appendIcon(usernameElem);
  }
} catch (e) {
  console.log("username field xpath failed");
}

browser.runtime.onMessage.addListener(function (request) {
  if (request.action === "fillingSignal") {
    console.log("Message received in content script:", request.body);

    let usernameElem: Element | null = document.evaluate(
      "(//form//input[   @type='email' or contains(@name, 'username')   or contains(@id, 'email')   or contains(@id, 'username')   or contains(@placeholder, 'Email')   or contains(@placeholder, 'Username')   or contains(ancestor::label, 'Email')   or contains(ancestor::label, 'Username')   or contains(@class, 'email')   or contains(@class, 'username')   or @aria-label='Email'   or @aria-label='Username'   or @aria-labelledby='Email'   or @aria-labelledby='Username' ] | //input[@type='text'])[1]",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as Element | null;

    if(usernameElem instanceof HTMLInputElement){
      usernameElem.value = request?.body[0];
    }

    let passwordElem: Element | null = document.evaluate(
      "(//form//input[ @type='password'or contains(@name, 'password')or contains(@id, 'password')or contains(@placeholder, 'Password')or contains(ancestor::label, 'Password')or contains(@class, 'password')or @aria-label='Password'or @aria-labelledby='Password'] | //input[@type='password'])[1]",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as Element | null;

    if(passwordElem instanceof HTMLInputElement){
      passwordElem.value = request?.body[1];
    }
 
  }
});
