import { usernameExp, passwordExp, loginButtonExp } from './constants';


export function getElement(name: string){

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