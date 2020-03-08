const fs = require('fs');
const path = require('path');
const babel = require('rollup-plugin-babel');
const replace = require('@rollup/plugin-replace');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const alias = require('@rollup/plugin-alias');
const postcss = require('postcss');
const cssModules = require('postcss-modules');
const pkg = require('../package.json');

const values = {
  'process.env.VERSION': pkg.version,
};
<% if (ts) { -%>
const extensions = ['.ts', '.tsx', '.js'];
<% } -%>

const rollupPluginMap = {
  css: () => cssPlugin(),
  alias: aliases => alias(aliases),
  babel: ({ babelConfig, esm }) => babel({
    // import helpers from '@babel/runtime'
    runtimeHelpers: true,
    plugins: [
      ['@babel/plugin-transform-runtime', {
        useESModules: esm,
        version: '^7.5.0', // see https://github.com/babel/babel/issues/10261#issuecomment-514687857
      }],
    ],
    exclude: 'node_modules/**',
<% if (ts) { -%>
    extensions,
<% } -%>
    ...babelConfig,
  }),
  replace: () => replace({ values }),
  resolve: () => resolve(<% if (ts) { %>{ extensions }<% } %>),
  commonjs: () => commonjs(),
};

function getPostcssPlugins({ cssModules } = {}) {
  return [
    require('precss'),
    require('postcss-color-function'),
    require('postcss-calc'),
    cssModules && require('postcss-modules')(cssModules),
    require('cssnano'),
  ].filter(Boolean);
}

function cssPlugin() {
  const cssMap = {};
  const postcssPlugins = {
    css: getPostcssPlugins(),
    cssModules: getPostcssPlugins({
      cssModules: {
        getJSON(cssFilename, json) {
          cssMap[cssFilename] = json;
        },
      },
    }),
  };
  return {
    name: 'CSSPlugin',
    resolveId(importee, importer) {
      if (importee.endsWith('.css')) {
        const cssId = path.resolve(path.dirname(importer), importee);
        this.addWatchFile(cssId);
        return `${cssId}.js`;
      }
    },
    load(id) {
      if (id.endsWith('.css.js')) {
        return new Promise((resolve, reject) => {
          fs.readFile(id.slice(0, -3), 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        });
      }
    },
    transform(code, id) {
      let plugins;
      const filename = id.slice(0, -3);
      if (filename.endsWith('.module.css')) {
        plugins = postcssPlugins.cssModules;
      } else if (filename.endsWith('.css')) {
        plugins = postcssPlugins.css;
      }
      if (plugins) {
        return postcss(plugins).process(code, {
          from: filename,
          parser: require('postcss-scss'),
        })
        .then(result => {
          const classMap = cssMap[filename];
          return [
            `export const css = ${JSON.stringify(result.css)};`,
            classMap && `export const classMap = ${JSON.stringify(classMap)};`,
          ].filter(Boolean).join('\n');
        });
      }
    },
  };
}

function getRollupPlugins({ babelConfig, esm, aliases } = {}) {
  return [
    aliases && rollupPluginMap.alias(aliases),
    rollupPluginMap.css(),
    rollupPluginMap.babel({ babelConfig, esm }),
    rollupPluginMap.replace(),
    rollupPluginMap.resolve(),
    rollupPluginMap.commonjs(),
  ].filter(Boolean);
}

function getExternal(externals = []) {
  return id => {
    if (/^@babel\/runtime[-/]/.test(id)) return true;
    return externals.some(pattern => {
      if (pattern && typeof pattern.test === 'function') return pattern.test(id);
      return id === pattern || id.startsWith(pattern + '/');
    });
  };
}

exports.getRollupPlugins = getRollupPlugins;
exports.getExternal = getExternal;
exports.DIST = 'dist';
