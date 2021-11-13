const fs = require('fs');
const Generator = require('yeoman-generator');
const { install, concatList, loadDeps, copyDir } = require('../../util');

function renameToTs(filename) {
  return filename.replace(/\.js$/, '.ts');
}

module.exports = class BaseGenerator extends Generator {
  _copyDir(src, dest) {
    copyDir(this, src, dest, this.state);
  }

  _updateDeps() {
    const devDepList = [
      '@babel/plugin-transform-react-jsx',
      '@gera2ld/plaid',
      '@gera2ld/plaid-rollup',
      'husky',
      'del-cli',
      'rollup-plugin-userscript',
      'prettier',
      'eslint-config-prettier',
      'eslint-plugin-prettier',
    ];
    const depList = [
      '@babel/runtime',
      '@violentmonkey/dom',
      '@violentmonkey/ui',
    ];
    if (this.state.ts) {
      devDepList.push(
        '@gera2ld/plaid-common-ts',
      );
    }
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
        default: pkg.name || this.appname,
      },
      {
        name: 'author',
        type: 'input',
        message: 'Author',
        default: pkg.author,
      },
      {
        name: 'ts',
        type: 'confirm',
        message: 'Do you want to use TypeScript?',
        default: false,
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
        dev: 'rollup -wc rollup.conf.js',
        clean: `del-cli dist${this.state.ts ? ' types' : ''}`,
        'build:js': 'rollup -c rollup.conf.js',
        prebuild: 'run-s ci clean',
        build: 'cross-env NODE_ENV=production run-s build:js',
        ci: 'run-s lint',
      },
    };
    const ext = [
      this.state.ts ? '.ts,.tsx' : '.js',
    ].filter(Boolean);
    pkg.scripts.lint = `eslint --ext ${ext.join(',')} .`;
    pkg.dependencies = {
      ...pkg.dependencies,
      ...loadDeps(this.state.depList),
    };
    pkg.devDependencies = {
      ...pkg.devDependencies,
      ...loadDeps(this.state.devDepList),
    };
    if (this.state.ts) {
      this._copyDir('_ts', '.');
    } else {
      this._copyDir('_js', '.');
    }
    this.fs.extendJSON(this.destinationPath('package.json'), pkg);
  }

  app() {
    this.fs.copyTpl(this.templatePath('src/meta.js'), this.destinationPath('src/meta.js'), this.state);
    this.fs.copyTpl(this.templatePath('src/index.js'), this.destinationPath(`src/index${this.state.ts ? '.ts' : '.js'}`), this.state);
    this.fs.copyTpl(this.templatePath('src/app.js'), this.destinationPath(`src/app${this.state.ts ? '.tsx' : '.js'}`), this.state);
    this.fs.copy(this.templatePath('src/style.css'), this.destinationPath('src/style.css'));
    this.fs.copy(this.templatePath('src/style.module.css'), this.destinationPath('src/style.module.css'));
    this._copyDir('src/types', 'src/types');
  }

  install() {
    install(this);
  }
}
