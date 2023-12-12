// Function to convert a binary string to an ArrayBuffer
function str2ab(str) {
  const buffer = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    buffer[i] = str.charCodeAt(i);
  }
  return buffer;
}

export async function importPublicKey(key) {
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
}
export async function encryptWithPublicKey(data, publicKey) {
  const encodedData = new TextEncoder().encode(data);
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    encodedData
  );
  return window.btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
}
