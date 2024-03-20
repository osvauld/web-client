import browser from "webextension-polyfill";
type TypeToClassKey = "read" | "manage";

export const setbackground = (type: TypeToClassKey): string => {

    const typeToClassMap: Record<TypeToClassKey, string> = {
        read: "bg-osvauld-readerOrange text-osvauld-readerText",
        manage: "bg-osvauld-managerPurple text-osvauld-managerText",
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