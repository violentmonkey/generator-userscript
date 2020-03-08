# @violentmonkey/generator-userscript

![NPM](https://img.shields.io/npm/v/@violentmonkey/generator-userscript.svg)

Yeoman generator to create a workspace for userscript easily.

Node.js v10.0+ is required.

## Features

- Modern syntax
  - JavaScript ESNext or TypeScript
  - JSX for DOM powered by [@violentmonkey/dom](https://github.com/violentmonkey/vm-dom)
- CSS
  - CSSNext powered by [PreCSS](https://github.com/jonathantneal/precss)
  - CSS modules (only applied for `.module.css` files)

## Usage

Run one of the following command in an empty directory:

```sh
# Option 1: Use the latest version from git
$ npx -p https://github.com/violentmonkey/generator-userscript.git -p yo yo @violentmonkey/userscript

# Option 2: Use the lastest released version from NPM
$ npx -p @violentmonkey/generator-userscript -p yo yo @violentmonkey/userscript
```
