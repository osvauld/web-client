import browser from 'webextension-polyfill';
document.addEventListener('DOMContentLoaded', function () {
    const forms = document.querySelectorAll('form');
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
});