import browser from 'webextension-polyfill';
document.addEventListener('readystatechange', function () {
    if (document.readyState === 'complete') {
        const forms = document.querySelectorAll('form');
        const currentURL = window.location.href;
        let usernameElem= document.evaluate(
            "(//form//input[   @type='email' or contains(@name, 'username')   or contains(@id, 'email')   or contains(@id, 'username')   or contains(@placeholder, 'Email')   or contains(@placeholder, 'Username')   or contains(ancestor::label, 'Email')   or contains(ancestor::label, 'Username')   or contains(@class, 'email')   or contains(@class, 'username')   or @aria-label='Email'   or @aria-label='Username'   or @aria-labelledby='Email'   or @aria-labelledby='Username' ] | //input[@type='text'])[1]",
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
    
        let passwordElem = document.evaluate(
            "(//form//input[ @type='password'or contains(@name, 'password')or contains(@id, 'password')or contains(@placeholder, 'Password')or contains(ancestor::label, 'Password')or contains(@class, 'password')or @aria-label='Password'or @aria-labelledby='Password'] | //input[@type='password'])[1]",
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;

        if(forms.length > 0){
            forms.forEach(form => {
                form.addEventListener('submit', function (event) {
                    const username = form.querySelector('input[type="text"], input[type="email"]')?.value;
                    const password = form.querySelector('input[type="password"]')?.value;
        
                    if (username && password) {
                        // Send message to the background script
                        browser.runtime.sendMessage({
                            action: 'credentialSubmit',
                            data: { username, password }
                        })
                    }
                });
            });
        } 
        // when detect when url is changing
        window.addEventListener('popstate', () => {
            if(forms.length === 0 && (usernameElem?.value && passwordElem?.value)){
                const username = usernameElem?.value;
                const password = passwordElem?.value
                browser.runtime.sendMessage({
                    action: 'credentialSubmit',
                    data: { username, password  }
                })
            }
        });
      
    }
});