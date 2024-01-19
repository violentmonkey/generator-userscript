import { readFile } from 'fs/promises';
import { basename, join, relative } from 'path';
import Generator from 'yeoman-generator';
import { globby } from 'globby';

function replaceDot(filename) {
  return filename.replace(/^_/, '.');
}

export default class UserScriptGenerator extends Generator {
  async _copyDir(src, dest) {
    const base = this.templatePath(src).replace(/\\/g, '/');
    const files = await globby(`${base}/**`, { nodir: true });
    const dir = this.destinationPath(dest);
    await Promise.all(
      files.map(async (file) => {
        const relpath = replaceDot(relative(base, file));
        await this.fs.copyTplAsync(file, join(dir, relpath), this.state);
      }),
    );
  }

  async prompting() {
    let pkg;
    try {
      pkg = JSON.parse(await readFile('package.json', 'utf8'));
      delete pkg.main;
      delete pkg.module;
      delete pkg.files;
    } catch (err) {
      // ignore
    }
    pkg ||= {};
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
        default: pkg.name || basename(this.destinationRoot()),
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

  async rootFiles() {
    await this._copyDir('_root', '.');
    const tplPkg = this.fs.readJSON(this.templatePath('_root/package.json'));
    const pkg = {
      ...tplPkg,
      ...this.state.pkg,
      name: this.state.name.replace(/\s+/g, '-').toLowerCase(),
      author: this.state.author,
      dependencies: {
        ...this.state.pkg.dependencies,
        // Use versions from tpl
        ...tplPkg.dependencies,
      },
      devDependencies: {
        ...this.state.pkg.devDependencies,
        // Use versions from tpl
        ...tplPkg.devDependencies,
      },
    };
    this.fs.extendJSON(this.destinationPath('package.json'), pkg);
  }

  async app() {
    await this._copyDir('src', 'src');
  }

  #cache = {};

  async #detectAsync(command, args) {
    try {
      await this.spawn(command, args);
      this.#cache[command] = true;
    } catch {
      this.#cache[command] = false;
    }
    return this.#cache[command];
  }

  _detect(command, args) {
    this.#cache[command] ||= this.#detectAsync(command, args);
    return this.#cache[command];
  }

  async install() {
    if (await this._detect('git', ['--version'])) {
      await this.spawn('git', ['init']);
    }
    if (await this._detect('pnpm', ['--version'])) {
      await this.spawn('pnpm', ['i']);
    } else if (await this._detect('yarn', ['--version'])) {
      await this.spawn('yarn');
    } else {
      await this.spawn('npm', ['i']);
    }
  }
}
