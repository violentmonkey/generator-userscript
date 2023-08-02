# @violentmonkey/generator-userscript

![NPM](https://img.shields.io/npm/v/@violentmonkey/generator-userscript.svg)

Yeoman generator to create a workspace for userscript easily.

## Prerequisites

- Node.js >= 16

## Features

- Modern syntax
  - TypeScript
  - JSX for DOM powered by [@violentmonkey/dom](https://github.com/violentmonkey/vm-dom)
- CSS
  - CSS modules (only applied for `.module.css` files)
  - [UnoCSS](https://unocss.dev/) is enabled by default

Read [this](https://violentmonkey.github.io/guide/using-modern-syntax/) for more details.

## Get Started

First of all, make a new directory for your userscript.

```sh
$ mkdir my-script
$ cd my-script
```

Then follow one of the options below to create the files.

### Option 1: npm

Please make sure your `npm` is up to date because in earlier versions (e.g. 8.12.x) there was a bug that prevented `npx` from installing the correct dependencies.

```bash
$ npm i npm -g

# Use the latest version from git
$ npx -p github:violentmonkey/generator-userscript -p yo yo @violentmonkey/userscript
```

### Option 2: pnpm

```bash
$ pnpm --package github:violentmonkey/generator-userscript --package yo dlx yo @violentmonkey/userscript
```
