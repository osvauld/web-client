
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
        chrome.storage.local.get("token"),
        chrome.storage.local.get("baseUrl")
    ]);
    return { token: token.token, baseUrl: baseUrl.baseUrl };
}