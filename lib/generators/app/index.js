const fs = require('fs');
const path = require('path');
const Generator = require('yeoman-generator');
const { install, concatList, loadDeps, copyDir, replaceDot } = require('../../util');

module.exports = class BaseGenerator extends Generator {
  _copyDir(src, dest) {
    copyDir(this, src, dest, this.state, relpath => {
      return replaceDot(relpath);
    });
  }

  _updateDeps() {
    const devDepList = [
      '@babel/plugin-transform-react-jsx',
      '@gera2ld/plaid',
      '@gera2ld/plaid-common-ts',
      '@gera2ld/plaid-rollup',
      'husky',
      'del-cli',
      'rollup-plugin-userscript',
      'prettier',
      'eslint-config-prettier',
      'eslint-plugin-prettier',
      '@violentmonkey/types',
    ];
    const depList = [
      '@babel/runtime',
      '@violentmonkey/dom',
      '@violentmonkey/ui',
    ];
    this.state.depList = concatList(this.state.depList, depList);
    this.state.devDepList = concatList(this.state.devDepList, devDepList);
  }

  async prompting() {
    let pkg;
    try {
      pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      delete pkg.dependencies;
      delete pkg.devDependencies;
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
    this._updateDeps();
  }

  rootFiles() {
    this._copyDir('_root', '.');
    const pkg = {
      name: this.state.name.replace(/\s+/g, '-').toLowerCase(),
      private: true,
      ...this.state.pkg,
      author: this.state.author,
      scripts: {
        ...this.state.pkg.scripts,
        prepare: 'husky install',
        dev: 'rollup -wc',
        clean: 'del-cli dist',
        'build:js': 'rollup -c',
        prebuild: 'run-s ci clean',
        build: 'cross-env NODE_ENV=production run-s build:js',
        ci: 'run-s lint',
      },
    };
    pkg.scripts.lint = `eslint --ext .ts,.tsx .`;
    pkg.dependencies = {
      ...pkg.dependencies,
      ...loadDeps(this.state.depList),
    };
    pkg.devDependencies = {
      ...pkg.devDependencies,
      ...loadDeps(this.state.devDepList),
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
