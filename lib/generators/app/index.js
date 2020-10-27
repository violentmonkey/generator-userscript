const fs = require('fs');
const path = require('path');
const Generator = require('yeoman-generator');
const globby = require('globby');
const { install, concatList, loadDeps } = require('../../util');

function replaceDot(filename) {
  return filename.replace(/^_/, '.');
}

function renameToTs(filename) {
  return filename.replace(/\.js$/, '.ts');
}

module.exports = class BaseGenerator extends Generator {
  _copyDir(src, dest, handle = replaceDot) {
    const base = this.templatePath(src).replace(/\\/g, '/');
    const files = globby.sync(`${base}/**`, { nodir: true });
    const dir = this.destinationPath(dest);
    for (const file of files) {
      const relpath = path.relative(base, file);
      this.fs.copyTpl(file, path.join(dir, handle(relpath)), this.state);
    }
  }

  _updateDeps() {
    const devDepList = [
      '@gera2ld/plaid',
      '@gera2ld/plaid-common-react',
      '@gera2ld/plaid-rollup',
      'husky',
      'del-cli',
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
      scripts: {
        ...this.state.pkg.scripts,
        dev: 'rollup -wc rollup.conf.js',
        clean: `del dist${this.state.ts ? ' types' : ''}`,
        'build:js': 'rollup -c rollup.conf.js',
        prebuild: 'npm run ci && npm run clean',
        build: 'npm run build:js --production',
        ci: 'npm run lint',
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
  }

  install() {
    install(this);
  }
}
