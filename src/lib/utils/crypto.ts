import { CryptoKeyPair } from "../dtos/cryptoKeys.dto";
import { Fields } from "../dtos/credential.dto";


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



export const decryptCredentialFields = async (
  encryptedFields: Fields[],
  privateKey: CryptoKey
): Promise<Fields[]> => {

  const decryptedFields: Fields[] = [];
  for (const field of encryptedFields) {

    const decryptedData = await decryptWithPrivateKey(privateKey, field.fieldValue);
    decryptedFields.push({ ...field, fieldValue: decryptedData });
  }
  return Promise.resolve(decryptedFields);
};



export const decryptCredentialField = async (privateKey: CryptoKey, field: string): Promise<string> => {
  const decryptedField = await decryptWithPrivateKey(privateKey, field);
  return decryptedField;
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


export const importRSAPrivateKey = async (keyString: string): Promise<CryptoKey> => {
  // Assuming keyString is a Base64-encoded string of the private key
  const keyBuffer = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));

  // Define the import algorithm parameters for RSA
  const importAlgorithm = {
    name: "RSA-OAEP",
    modulusLength: 2048, // This should match the modulus length used during generation
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // Public exponent used during key generation
    hash: { name: "SHA-256" }, // Hash algorithm
  };

  // Import the key
  try {
    const cryptoKey = await window.crypto.subtle.importKey(
      "pkcs8", // The format of the key to be imported
      keyBuffer,
      importAlgorithm,
      true, // Whether the key is extractable
      ["decrypt"] // The intended use for the key (decryption in this case)
    );

    return cryptoKey;
  } catch (e) {
    console.error("Error importing RSA private key: ", e);
    throw e;
  }
};

export const importRSAPublicKey = async (publicKeyString: string): Promise<CryptoKey> => {
  // Assuming publicKeyString is a Base64-encoded string of the public key
  const keyBuffer = Uint8Array.from(atob(publicKeyString), c => c.charCodeAt(0));

  // Define the import algorithm parameters for RSA-OAEP
  const importAlgorithm = {
    name: "RSA-OAEP",
    hash: { name: "SHA-256" } // The hash function used with the algorithm
  };

  // Import the public key
  try {
    const cryptoKey = await window.crypto.subtle.importKey(
      "spki", // The format of the key to be imported (SubjectPublicKeyInfo)
      keyBuffer,
      importAlgorithm,
      true, // Whether the key is extractable
      ["encrypt"] // The intended use for the key (encryption in this case)
    );

    return cryptoKey;
  } catch (e) {
    console.error("Error importing RSA public key: ", e);
    throw e;
  }
};

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

export const exportKey = async (key: CryptoKey, format: "pkcs8" | "spki"): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey(format, key);
  const exportedAsArray = Array.from(new Uint8Array(exported));
  const exportedAsBase64 = btoa(String.fromCharCode.apply(null, exportedAsArray));
  return exportedAsBase64;
}

export const generateRSAKeyPairForEncryption = async (): Promise<CryptoKeyPair> => {

  try {
    // Generate the key pair
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
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

const base64ToUnit8ArrayBuffer = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const deriveKeyFromPassphrase = async (passphrase: string, saltString: string): Promise<CryptoKey> => {

  // Convert the passphrase to an ArrayBuffer
  const enc = new TextEncoder();
  const passphraseBuffer = enc.encode(passphrase);

  // Generate a salt (use a fixed salt to ensure determinism)
  const salt = base64ToUnit8ArrayBuffer(saltString)

  // Import the passphrase to a CryptoKey
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    passphraseBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // Derive a key from the passphrase
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // Number of iterations (higher means more secure but slower)
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 }, // Specify the desired key type and length
    true,
    ["encrypt", "decrypt"]
  );

  return key
  // The key can now be used for encryption and decryption
}

export const encryptPvtKeyWithSymmerticKey = async (symmetricKey: CryptoKey, pvtKeyString: string, ivString: string): Promise<string> => {
  const enc = new TextEncoder();
  const dataBuffer = enc.encode(pvtKeyString);
  const iv = base64ToArrayBuffer(ivString);
  // Encrypt the data
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    symmetricKey,
    dataBuffer
  );

  // Convert the encrypted data to a Base64 string
  return arrayBufferToString(encrypted);
}


export const generateRandomString = (): string => {
  const randomStringBuffer = window.crypto.getRandomValues(new Uint8Array(12));
  return arrayBufferToString(randomStringBuffer)
}

export const decryptPvtKeys = async (symmetricKey: CryptoKey, signPvtKey: string, encryptionPvtKey: string, ivString: string): Promise<{ eccPvtKey: CryptoKey, rsaPvtKey: CryptoKey }> => {
  const iv = base64ToArrayBuffer(ivString);
  const eccKeyStr = await decryptWithSymmetricKey(symmetricKey, signPvtKey, iv);
  const eccPvtKey = await importECCPrivateKey(eccKeyStr);
  const rsaKeyStr = await decryptWithSymmetricKey(symmetricKey, encryptionPvtKey, iv);
  const rsaPvtKey = await importRSAPrivateKey(rsaKeyStr);
  return { eccPvtKey, rsaPvtKey }
}

const decryptWithSymmetricKey = async (symmetricKey: CryptoKey, encryptedData: string, iv: ArrayBuffer): Promise<string> => {
  // Convert the base64 encoded encrypted data to an ArrayBuffer
  const encryptedArrayBuffer = base64ToArrayBuffer(encryptedData);

  // Decrypt the data using the private key
  const decryptedArrayBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    symmetricKey,
    encryptedArrayBuffer
  );

  // Convert the decrypted ArrayBuffer to a string
  const decryptedData = new TextDecoder().decode(decryptedArrayBuffer);

  return decryptedData
}





export const derivePublicKeyFromECCPrivateKey = async (privateKey: CryptoKey): Promise<string> => {
  // Export the private key to JWK format
  const jwkPrivateKey = await window.crypto.subtle.exportKey('jwk', privateKey);

  // Check if the key is of type EC (Elliptic Curve)
  if (jwkPrivateKey.kty !== "EC") {
    throw new Error("Provided key is not an Elliptic Curve key");
  }

  // Create a JWK public key object
  const jwkPublicKey = {
    kty: jwkPrivateKey.kty,
    crv: jwkPrivateKey.crv,
    x: jwkPrivateKey.x,
    y: jwkPrivateKey.y,
    ext: true,
  };

  // Import the JWK public key as a CryptoKey
  const publicKey = await window.crypto.subtle.importKey(
    'jwk',
    jwkPublicKey,
    {
      name: 'ECDSA',
      namedCurve: jwkPrivateKey.crv,
    },
    true,
    ['verify']
  );

  // Export the public key in the desired format (e.g., 'spki')
  const publicKeyString = await exportKey(publicKey, 'spki');
  return publicKeyString;
};