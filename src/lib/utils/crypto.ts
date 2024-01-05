import { CryptoKeyPair } from "../dtos/cryptoKeys.dto";

// Function to convert a binary string to an ArrayBuffer
import { CredentialFields } from "../dtos/credential.dto";

const str2ab = (str: string) => {
  const buffer = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    buffer[i] = str.charCodeAt(i);
  }
  return buffer;
};

export const importPublicKey = (key: string): Promise<CryptoKey> => {
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

function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const encryptWithPublicKey = async (
  data: string,
  publicKey: CryptoKey
) => {
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

export const importPrivateKey = async (key: string): Promise<CryptoKey> => {
  let pem = atob(key);
  // Remove the "BEGIN PRIVATE KEY" and "END PRIVATE KEY" parts
  pem = pem.replace("-----BEGIN PRIVATE KEY-----", "");
  pem = pem.replace("-----END PRIVATE KEY-----", "");
  pem = pem.replace(/\s+|\n\r|\n|\r$/gm, ""); // remove newlines
  // Decode the base64 string
  const binaryDer = str2ab(atob(pem));

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

export const decryptCredentialFields = async (
  encryptedFields: CredentialFields[],
  privateKey: string
): Promise<CredentialFields[]> => {
  const pvtKey = await importPrivateKey(privateKey).catch((error) => {
    console.log("ERRRR", error);
  });
  const decryptedFields: CredentialFields[] = [];
  for (const field of encryptedFields) {
    if (pvtKey === undefined) throw new Error("Private key is undefined");
    const decryptedData = await decryptWithPrivateKey(pvtKey, field.fieldValue);
    decryptedFields.push({ ...field, fieldValue: decryptedData });
  }
  return Promise.resolve(decryptedFields);
};

const decryptWithPrivateKey = async (
  privateKey: CryptoKey,
  encryptedData: string
): Promise<string> => {
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

export const importECCPrivateKey = async (keyString: string): Promise<CryptoKey> => {
  // Assuming keyString is a Base64-encoded string of the private key
  const keyBuffer = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));

  // Define the import algorithm parameters for ECC
  const importAlgorithm: EcKeyImportParams = {
    name: "ECDSA", // Or "ECDSA", depending on your use case
    namedCurve: "P-256" // Replace with your curve name, e.g., "P-384", "P-521"
  };

  // Import the key
  try {
    const cryptoKey = await window.crypto.subtle.importKey(
      "pkcs8", // format of the key to import
      keyBuffer,
      importAlgorithm,
      true, // whether the key is extractable
      ["sign"] // usage of the key
    );

    return cryptoKey;
  } catch (e) {
    console.error("Error importing key: ", e);
    throw e;
  }
}



export const signTextWithPrivateKey = async (privateKey: CryptoKey, text: string) => {

  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Sign the string
  return window.crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" }
    },
    privateKey,
    data
  ).then((sig) => {
    return arrayBufferToString(sig)
  }).catch((error) => {
    console.log("Errorr", error)
  })

}

function arrayBufferToString(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64String = window.btoa(binary);
  return base64String
}

export const verifySignatureWithPublicKey = async (publicKeyBase64: string, text: string, signature: string) => {
  console.log("VERIFYING", publicKeyBase64, text, signature)
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Convert the base64 signature back to an ArrayBuffer
  const binary = window.atob(signature);
  const signatureBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    signatureBytes[i] = binary.charCodeAt(i);
  }

  // Convert the base64 public key back to an ArrayBuffer
  const publicKeyBinary = window.atob(publicKeyBase64);
  const publicKeyBytes = new Uint8Array(publicKeyBinary.length);
  for (let i = 0; i < publicKeyBinary.length; i++) {
    publicKeyBytes[i] = publicKeyBinary.charCodeAt(i);
  }

  // Import the public key
  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    publicKeyBytes,
    {
      name: "ECDSA",
      namedCurve: "P-256",
      hash: { name: "SHA-256" }
    },
    true,
    ["verify"]
  );

  // Verify the signature
  return window.crypto.subtle.verify(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" }
    },
    publicKey,
    signatureBytes,
    data
  ).then((isValid) => {
    return isValid;
  }).catch((error) => {
    console.log("Error", error);
  });
}
export const generateECCKeyPairForSigning = async (): Promise<CryptoKeyPair> => {
  // Define the algorithm parameters for ECC key generation
  const keyGenAlgorithm: EcKeyGenParams = {
    name: "ECDSA",
    namedCurve: "P-256" // Commonly used curves are P-256, P-384, and P-521
  };

  try {
    // Generate the key pair
    const keyPair = await window.crypto.subtle.generateKey(
      keyGenAlgorithm,
      true, // whether the keys are extractable
      ["sign", "verify"] // private key for signing, public key for verifying
    );

    const privateKeyString = await exportKey(keyPair.privateKey, "pkcs8");

    // Export the public key
    const publicKeyString = await exportKey(keyPair.publicKey, "spki");

    return {
      privateKey: privateKeyString,
      publicKey: publicKeyString
    }
  } catch (e) {
    console.error("Error generating ECC key pair: ", e);
    throw e;
  }
}

async function exportKey(key: CryptoKey, format: "pkcs8" | "spki"): Promise<string> {
  const exported = await window.crypto.subtle.exportKey(format, key);
  const exportedAsBase64 = btoa(String.fromCharCode.apply(null, new Uint8Array(exported)));
  return exportedAsBase64;
}
