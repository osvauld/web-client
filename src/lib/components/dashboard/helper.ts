import browser from "webextension-polyfill";
type TypeToClassKey = "reader" | "manager";

export const setbackground = (type: TypeToClassKey): string => {

    const typeToClassMap: Record<TypeToClassKey, string> = {
        reader: "bg-osvauld-readerOrange text-osvauld-readerText",
        manager: "bg-osvauld-managerPurple text-osvauld-managerText",
    };

    return typeToClassMap[type] || "";
}



export const getTokenAndBaseUrl = async () => {
    const [token, baseUrl] = await Promise.all([
        browser.storage.local.get("token"),
        browser.storage.local.get("baseUrl")
    ]);
    return { token: token.token, baseUrl: baseUrl.baseUrl };
}

export const sendMessage = async (action: string, data: any = {}) => {
    const response = await browser.runtime.sendMessage({
        action,
        data,
    });
    console.log(response, action, data);
    return response;
}


export const clickOutside = (node) => {

    const handleClick = event => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(
                new CustomEvent('clickedOutside', node)
            )
        }
    }

    document.addEventListener('click', handleClick, true);

    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    }
}