import path from 'path';
import plaid from '@gera2ld/plaid';
import userscript from 'rollup-plugin-userscript';
import pkg from './package.json' assert { type: 'json' };

const { getRollupPlugins } = plaid;
const DIST = 'dist';
const FILENAME = 'index';

export default async () => {
  const bundleOptions = {
    extend: true,
    esModule: false,
  };
  const postcssOptions = {
    // Support Tailwind CSS
    ...(await import('@gera2ld/plaid/config/postcssrc.js')).default,
    inject: false,
    minimize: true,
  };
  const rollupConfig = [
    {
      input: 'src/index.ts',
      plugins: [
        ...getRollupPlugins({
          esm: true,
          minimize: false,
          postcss: postcssOptions,
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
      ],
      output: {
        format: 'iife',
        file: `${DIST}/${FILENAME}.user.js`,
        globals: {
          '@violentmonkey/dom': 'VM',
          '@violentmonkey/ui': 'VM',
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

  return rollupConfig;
}
