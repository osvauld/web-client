// Function to convert a binary string to an ArrayBuffer
function str2ab(str) {
  const buffer = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    buffer[i] = str.charCodeAt(i);
  }
  return buffer;
}

export const importPublicKey = (key) => {
  // Decode the base64-encoded PEM string
  let pem = atob(key);

  // Define the PEM header and footer for a public key
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";

  // Extract the base64-encoded content from the PEM string,
  // removing the header and footer. The '-1' in the substring function
  // accounts for the newline character at the end of the header.
  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length - 1
  );

  // Decode the extracted base64-encoded content to get the binary data
  const binaryStr = window.atob(pemContents);

  // Convert the binary string to an ArrayBuffer
  const buff = str2ab(binaryStr);

  // Import the public key using the Web Crypto API
  return window.crypto.subtle.importKey(
    "spki", // The format of the key to be imported (SubjectPublicKeyInfo)
    buff, // The public key data
    {
      name: "RSA-OAEP", // The algorithm the imported key will be used with
      hash: "SHA-256", // The hash function to be used with the algorithm
    },
    true, // Whether the key is extractable
    ["encrypt"] // The intended use for the key (encryption in this case)
  );
};

function base64ToArrayBuffer(base64) {
  console.log(base64);
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const encryptWithPublicKey = async (data, publicKey) => {
  const encodedData = new TextEncoder().encode(data);
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    encodedData
  );
  return window.btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
};

export const importPrivateKey = async (key) => {
  let pem = atob(key);
  // Remove the "BEGIN PRIVATE KEY" and "END PRIVATE KEY" parts
  pem = pem.replace("-----BEGIN PRIVATE KEY-----", "");
  pem = pem.replace("-----END PRIVATE KEY-----", "");
  pem = pem.replace(/\s+|\n\r|\n|\r$/gm, ""); // remove newlines
  // Decode the base64 string
  const binaryDer = str2ab(window.atob(pem));

  // Import the binary formatted private key using the Web Crypto API
  return window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
};

export const decryptCredentialFields = async (encryptedFields, privateKey) => {
  const pvtKey = await importPrivateKey(privateKey).catch((error) => {
    console.log("ERRRR", error);
  });
  const decryptedFields = [];
  for (const field of encryptedFields) {
    const decryptedData = await decryptWithPrivateKey(pvtKey, field.fieldValue);
    decryptedFields.push({ ...field, fieldValue: decryptedData });
  }
  return decryptedFields;
};

const decryptWithPrivateKey = async (privateKey, encryptedData) => {
  // Convert the base64 encoded encrypted data to an ArrayBuffer
  const encryptedArrayBuffer = base64ToArrayBuffer(encryptedData);

  // Decrypt the data using the private key
  const decryptedArrayBuffer = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedArrayBuffer
  );

  // Convert the decrypted ArrayBuffer to a string
  const decryptedData = new TextDecoder().decode(decryptedArrayBuffer);

  return decryptedData;
};
