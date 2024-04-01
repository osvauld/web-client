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


// export const FetchSensitiveFieldsAndDecrypt = async (credentialId: string) => {

//     const response = await fetchSensitiveFieldsByCredentialId(credentialId);
//     let sensitiveFields = response.data;
//     for (let field of sensitiveFields) {
//         const response = await sendMessage("decryptField", field.fieldValue);
//         let decryptedValue = response.data;
//         sensitiveFieldsForEdit.push({
//             fieldName: field.fieldName,
//             fieldValue: decryptedValue,
//             sensitive: true,
//         });
//     }
//     return sensitiveFieldsForEdit;
// };