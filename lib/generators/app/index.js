const fs = require('fs');
const path = require('path');
const Generator = require('yeoman-generator');
const { install, copyDir, replaceDot } = require('../../util');

module.exports = class BaseGenerator extends Generator {
  _copyDir(src, dest) {
    copyDir(this, src, dest, this.state, relpath => {
      return replaceDot(relpath);
    });
  }

  async prompting() {
    let pkg;
    try {
      pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      delete pkg.main;
      delete pkg.module;
      delete pkg.files;
    } catch (err) {
      // ignore
    }
    pkg = pkg || {};
    const state = {
      pkg,
      year: new Date().getFullYear(),
      ...this.options,
    };
    const answers = await this.prompt([
      {
        name: 'name',
        type: 'input',
        message: 'Your project name',
        default: pkg.name || path.basename(this.destinationRoot()),
      },
      {
        name: 'author',
        type: 'input',
        message: 'Author',
        default: pkg.author,
      },
    ]);
    this.state = {
      ...state,
      ...answers,
    };
  }

  rootFiles() {
    this._copyDir('_root', '.');
    const pkg = {
      name: this.state.name.replace(/\s+/g, '-').toLowerCase(),
      private: true,
      ...this.state.pkg,
      author: this.state.author,
    };
    this.fs.extendJSON(this.destinationPath('package.json'), pkg);
  }

  app() {
    this._copyDir('src', 'src');
  }

  install() {
    install(this);
  }
}
