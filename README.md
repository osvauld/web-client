<br /><br />
<p align="center">
<a href="https://osvauld.com">
  <img src="https://raw.githubusercontent.com/tonyantony300/crispy-guacamole/master/assets/logo.png" alt="Osvauld Logo" width="70">
</a>
</p>

<p align="center"><b>Share credentials the most secure way</b></p>


<p>
   <a href="https://app.osvauld.com/#gh-light-mode-only" target="_blank">
      <img
        src="https://raw.githubusercontent.com/osvauld/Docs/master/assets/Dashboardnew.png"
        alt="Osvauld Screens"
        width="100%"
      />
    </a>


</p>


Meet [osvauld](https://osvauld.com). An open-source credential management tool intended to solve password problem teams face. Osvauld helps to enforce password/token hygiene and visibilty across your team thus resulting in better overall security. osvauld is built from ground up with security in mind. 



## 🚀 Features


- **Share credential to groups of members**: Collaborate effectively by creating groups, share credentials exclusively with HR group or marketing group.
- **Arrange credentials as folders**: Folders are a great way to arrange tokens/keys which can be shared to groups or individuals in your team.
- **Intutive sharing mechanism**: Allocate access to credentials in simple steps, Read/Write/Owner access formats provide a shallow learning curve.
- **Credential assist**: Access corresponding credentials allocated and tied to URLs you visit with the popup easily.
- **Audit logs**: Admin can view which credentials are being accessed at what frequency.
- **Easy Password rotation**: Credentials can be tied to an expiray date as per company policies admin has the transparency to view and change production keys when required.

## 🔒 Security Features

- **Zero-knowledge Architecture**: all your credentials including meta data never leaves your browser unencrypted and only you and to whom you shared can decrypt it using corresponding secret password.
- **Open-PGP sharing**: Quickly share credentials with your team with open-PGP sharing mechanism, It is a 40-year old battle tested cryptography protocol suit.
- **WASM Sandboxing**: wasm module provides an extra layer of sandoxing for the cryptographic operations.
- **Utilizes Seqouia PGP**: Focus on safety and correctness, Uses a memory-safe language, First-Class Library.
- **ECC and AES encryption**: osvauld uses the OpenPGP RFC 4880 standard with ECC Curve25519 to facilitate the sharing functionality and AES-256 for vault encryption.


## 🍙 On-Premise First

osvauld is meant to be an on-prem first solution, this give you more control over your data and reduce your dependency on centralised password management solution on cloud. For self hosting environment setup, visit the [On-Prem](https://docs.osvauld.com/installation/setting-up-osvauld/) documentation page


## 🛠️ Tech

Its UI is written in [Svelte](https://svelte.dev) using [TypeScript](https://www.typescriptlang.org) and its backend is written in [Go](https://go.dev).
It utilizes a WebAssembly [WASM](https://webassembly.org) module, compiled from [Rust](https://www.rust-lang.org), for the fastest, memory-safe crypto operations possible.


## 🚢 Onboard osvauld

Osvauld is still in its early days, not everything will be perfect yet, and hiccups may happen. Please let us know of any suggestions, ideas, or bugs that you encounter on our [Discord](https://discord.gg/u43atWCS) or GitHub issues, and we will use your feedback to improve on our upcoming releases.

For setting up osvauld, please refer to our [deployment documentation](https://docs.osvauld.com/installation/setting-up-osvauld/)

## 🎖️ Contribute to make us better

Contributors guide for setting up osvauld [Guide](https://docs.osvauld.com/installation/setting-up-dev-server/)

Join our Discord server [Discord](https://discord.gg/u43atWCS), let us help you get started.


## 📸 Screenshots

<p>
    <a href="https://app.osvauld.com/#gh-dark-mode-only" target="_blank">
      <img
        src="https://raw.githubusercontent.com/osvauld/Docs/master/assets/FolderAccessListEdit.png"
        alt="Osvauld Folder access edit"
        width="100%"
      />
    </a>
    <a href="https://osvauld.com" target="_blank">
      <img
        src="https://raw.githubusercontent.com/osvauld/Docs/master/assets/Groups.png"
        alt="Osvauld Group view"
        width="100%"
      />
    </a>
</p>
<p>
    <a href="https://osvauld.com" target="_blank">
      <img
        src="https://raw.githubusercontent.com/osvauld/Docs/master/assets/ShareFolder.png"
        alt="Osvauld Sharing folder"
        width="100%"
      />
    </a>
            <a href="https://osvauld.com" target="_blank">
      <img
        src="https://raw.githubusercontent.com/osvauld/Docs/master/assets/Cardonclick.png"
        alt="Osvauld Issue Details"
        width="100%"
      />
    </a>
</p>

 

## 📚Documentation

For full documentation, visit [docs.osvauld.com](https://docs.osvauld.com/introduction/overview/)

To see how to Contribute, visit [here](https://github.com/osvauld/web-client/Osvauld/blob/master/CONTRIBUTING.md).

## ❤️ Community

The Osvauld community can be found on GitHub Discussions, where you can ask questions, voice ideas, and share your projects.

To chat with other community members you can join the [osvauld Discord](https://discord.gg/u43atWCS).

Our [Code of Conduct](https://github.com/osvauld/web-client/Osvauld/blob/master/CODE_OF_CONDUCT.md) applies to all Osvauld community channels.

## ⛓️ Security

If you believe you have found a security vulnerability in Osvauld, we encourage you to responsibly disclose this and not open a public issue. We will investigate all legitimate reports. Email abe@osvauld.com to disclose any security vulnerabilities.
