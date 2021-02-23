const path = require('path');
const globby = require('globby');
const depMap = require('./deps.json').dependencies;

exports.replaceContent = (ins, file, replace) => {
  const filePath = ins.destinationPath(file);
  let source;
  try {
    source = ins.fs.read(filePath);
  } catch (err) {
    return;
  }
  let content = replace(source);
  if (content === undefined) content = source;
  ins.fs.write(filePath, content);
};

exports.replaceJSON = (ins, file, replace) => {
  const filePath = ins.destinationPath(file);
  const source = ins.fs.readJSON(filePath);
  let content = replace(source);
  if (content === undefined) content = source;
  ins.fs.writeJSON(filePath, content);
};

exports.concatList = (...args) => args.filter(Boolean).flat();

exports.loadDeps = (depList) => depList.reduce((res, key) => {
  if (!depMap[key]) throw new Error(`${key} is not found`);
  res[key] = depMap[key];
  return res;
}, {});

exports.replaceDot = replaceDot;

exports.copyDir = (ins, src, dest, state, handle = replaceDot) => {
  const base = ins.templatePath(src).replace(/\\/g, '/');
  const files = globby.sync(`${base}/**`, { nodir: true });
  const dir = ins.destinationPath(dest);
  for (const file of files) {
    const relpath = path.relative(base, file);
    ins.fs.copyTpl(file, path.join(dir, handle(relpath)), state);
  }
};

exports.install = (ins) => {
  if (hasYarn(ins)) {
    ins.yarnInstall();
  } else {
    ins.npmInstall();
  }
};

let _hasYarn;
function hasYarn(ins) {
  if (_hasYarn == null) {
    const res = ins.spawnCommandSync('yarn', ['--version']);
    _hasYarn = !(res.error && res.error.code === 'ENOENT');
  }
  return _hasYarn;
}

function replaceDot(filename) {
  return filename.replace(/^_/, '.');
}
