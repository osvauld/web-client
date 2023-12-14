import browser from "webextension-polyfill";

// let headings = document.getElementById("firstHeading");
// headings.style.color = "red";


browser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "fillingSignal") {
            console.log("Message received in content script:", request.body);

            let usernameElem = document.evaluate(
                "(//form//input[   @type='email' or contains(@name, 'username')   or contains(@id, 'email')   or contains(@id, 'username')   or contains(@placeholder, 'Email')   or contains(@placeholder, 'Username')   or contains(ancestor::label, 'Email')   or contains(ancestor::label, 'Username')   or contains(@class, 'email')   or contains(@class, 'username')   or @aria-label='Email'   or @aria-label='Username'   or @aria-labelledby='Email'   or @aria-labelledby='Username' ] | //input[@type='text'])[1]",
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              ).singleNodeValue;
              usernameElem.value = request?.body[0];
           
            let passwordElem = document.evaluate(
                "(//form//input[ @type='password'or contains(@name, 'password')or contains(@id, 'password')or contains(@placeholder, 'Password')or contains(ancestor::label, 'Password')or contains(@class, 'password')or @aria-label='Password'or @aria-labelledby='Password'] | //input[@type='password'])[1]",
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              ).singleNodeValue;
        
              passwordElem.value = request?.body[1];

        }
    }
);
