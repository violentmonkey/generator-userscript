# @violentmonkey/generator-userscript

![NPM](https://img.shields.io/npm/v/@violentmonkey/generator-userscript.svg)

Yeoman generator to create a workspace for userscript easily.

## Prerequisites

- Node.js >= 12

## Features

- Modern syntax
  - JavaScript ESNext or TypeScript
  - JSX for DOM powered by [@violentmonkey/dom](https://github.com/violentmonkey/vm-dom)
- CSS
  - CSS modules (only applied for `.module.css` files)
  - [tailwindcss](https://tailwindcss.com/) is enabled by default, but **only for CSS, don't use it in JavaScript or templates**

Read [this](https://violentmonkey.github.io/guide/using-modern-syntax/) for more details.

## Usage

```sh
$ mkdir my-script
$ cd my-script

# Remove npx cache if needed
$ NPM_CACHE=`npm config get cache` # -> `~/.npm`
$ rm -rf $NPM_CACHE/_npx

# Use the latest version from git
$ npx -p https://github.com/violentmonkey/generator-userscript.git -p yo yo @violentmonkey/userscript
```
