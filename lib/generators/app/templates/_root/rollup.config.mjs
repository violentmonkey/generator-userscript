import path from 'path';
import plaid from '@gera2ld/plaid';
import userscript from 'rollup-plugin-userscript';
import pkg from './package.json' assert { type: 'json' };

const { getRollupPlugins } = plaid;
const DIST = 'dist';

const bundleOptions = {
  extend: true,
  esModule: false,
};
const rollupConfig = [
  {
    input: 'src/index.ts',
    plugins: [
      ...getRollupPlugins({
        esm: true,
        minimize: false,
        postcss: {
          inject: false,
          minimize: true,
        },
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
      }),
      userscript(
        path.resolve('src/meta.js'),
        meta => meta
          .replace('process.env.VERSION', pkg.version)
          .replace('process.env.AUTHOR', pkg.author),
      ),
    ],
    external: [
      '@violentmonkey/ui',
      '@violentmonkey/dom',
      'solid-js',
      'solid-js/web',
    ],
    output: {
      format: 'iife',
      file: `${DIST}/index.user.js`,
      globals: {
        '@violentmonkey/dom': 'VM',
        '@violentmonkey/ui': 'VM',
        // solid-js doesn't provide a UMD bundle, so use the prebuilt version from `@violentmonkey/dom`
        'solid-js': 'VM.solid',
        'solid-js/web': 'VM.solid.web',
      },
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
  };
});

export default rollupConfig;
