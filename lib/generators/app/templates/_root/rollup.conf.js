const fs = require('fs');
const { getRollupPlugins } = require('@gera2ld/plaid');
const pkg = require('./package.json');

const DIST = 'dist';
const FILENAME = 'index';
const BANNER = fs.readFileSync('src/meta.js', 'utf8')
.replace('process.env.VERSION', pkg.version)
.replace('process.env.AUTHOR', pkg.author);

<% const ext = ts ? '.ts' : '.js'; -%>
const bundleOptions = {
  extend: true,
  esModule: false,
};
const postcssOptions = {
  ...require('@gera2ld/plaid/config/postcssrc'),
  inject: false,
  minimize: true,
};
const rollupConfig = [
  {
    input: {
      input: 'src/index<%= ext %>',
      plugins: getRollupPlugins({
        esm: true,
        minimize: false,
        postcss: postcssOptions,
<% if (ts) { -%>
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
<% } -%>
      }),
    },
    output: {
      format: 'iife',
      file: `${DIST}/${FILENAME}.user.js`,
      ...bundleOptions,
    },
  },
];

rollupConfig.forEach((item) => {
  item.output = {
    indent: false,
    // If set to false, circular dependencies and live bindings for external imports won't work
    externalLiveBindings: false,
    ...item.output,
    ...BANNER && {
      banner: BANNER,
    },
  };
});

module.exports = rollupConfig.map(({ input, output }) => ({
  ...input,
  output,
}));
