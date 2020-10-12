const fs = require('fs');
const path = require('path');
const Generator = require('yeoman-generator');
const globby = require('globby');
const { install } = require('../../util');

module.exports = class BaseGenerator extends Generator {
  _copyDir(src, dest) {
    const files = globby.sync(`${this.templatePath(src).replace(/\\/g, '/')}/**`, { nodir: true });
    const dir = this.destinationPath(dest);
    for (const file of files) {
      const destFile = path.join(dir, path.basename(file).replace(/^_/, '.'));
      this.fs.copyTpl(file, destFile, this.state);
    }
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
  }

  rootFiles() {
    this._copyDir('_root', '.');
    const pkg = {
      name: this.state.name.replace(/\s+/g, '-').toLowerCase(),
      ...this.state.pkg,
      scripts: {
        ...this.state.pkg.scripts,
        dev: 'rollup -wc rollup.conf.js',
        clean: `del dist${this.state.ts ? ' types' : ''}`,
        build: 'npm run build:js',
        'build:js': 'rollup -c rollup.conf.js',
        prebuild: 'npm run ci && npm run clean',
        prepublishOnly: 'npm run build',
        ci: 'npm run lint',
        lint: `eslint${this.state.ts ? ' --ext .ts,.tsx' : ''} .`,
      },
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
    if (this.state.ts) {
      this.fs.copy(this.templatePath('src/index.d.ts'), this.destinationPath('src/index.d.ts'));
    }
    this.fs.copy(this.templatePath('src/style.css'), this.destinationPath('src/style.css'));
    this.fs.copy(this.templatePath('src/style.module.css'), this.destinationPath('src/style.module.css'));
  }

  install() {
    const devDeps = [
      'husky',
      '@gera2ld/plaid@~2.0.0',
      '@gera2ld/plaid-common-react@~2.0.0',
      '@gera2ld/plaid-rollup@~2.0.0',
    ];
    const deps = [
      '@babel/runtime',
    ];
    if (this.state.gulp) {
      devDeps.push(
        'gulp',
        'del',
        'fancy-log',
      );
    } else {
      devDeps.push(
        'del-cli',
      );
    }
    if (this.state.ts) {
      devDeps.push(
        '@babel/preset-typescript',
        'typescript',
        '@typescript-eslint/parser',
        '@typescript-eslint/eslint-plugin',
      );
    }
    install(this, devDeps, deps);
  }
}
