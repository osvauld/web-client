

export const usernameExp = "(//form//input[   @type='email' or contains(@name, 'username')   or contains(@id, 'email')   or contains(@id, 'username')   or contains(@placeholder, 'Email')   or contains(@placeholder, 'Username')   or contains(ancestor::label, 'Email')   or contains(ancestor::label, 'Username')   or contains(@class, 'email')   or contains(@class, 'username')   or @aria-label='Email'   or @aria-label='Username'   or @aria-labelledby='Email'   or @aria-labelledby='Username' ] )[1]";

export const passwordExp = "(//form//input[ @type='password'or contains(@name, 'password')or contains(@id, 'password')or contains(@placeholder, 'Password')or contains(ancestor::label, 'Password')or contains(@class, 'password')or @aria-label='Password'or @aria-labelledby='Password'] | //input[@type='password'])[1]";


export const loginButtonExp = "(//button[contains(@type, 'submit') or contains(@id, 'login') or contains(@name, 'login') or contains(@value, 'login') or contains(@class, 'login') or contains(text(), 'Login') or contains(text(), 'Log In') or @aria-label='Login' or @aria-label='Log In' or @aria-labelledby='Login' or @aria-labelledby='Log In'] | //input[@type='submit'])[1] | (//button[contains(@type, 'submit') or contains(@id, 'signup') or contains(@name, 'signup') or contains(@value, 'signup') or contains(@class, 'signup') or contains(text(), 'Signup') or contains(text(), 'Sign Up') or @aria-label='Signup' or @aria-label='Sign Up' or @aria-labelledby='Signup' or @aria-labelledby='Sign Up'] | //input[@type='submit'])[1]";
