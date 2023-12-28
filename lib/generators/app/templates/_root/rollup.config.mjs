import path from 'path';
import { defineConfig } from 'rollup';
import { definePlugins, defineExternal } from '@gera2ld/plaid-rollup';
import userscript from 'rollup-plugin-userscript';
import pkg from './package.json' assert { type: 'json' };

export default defineConfig({
  input: 'src/index.ts',
  plugins: [
    ...definePlugins({
      esm: true,
      minimize: false,
      postcss: {
        inject: false,
        minimize: true,
      },
      extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
    }),
    userscript(path.resolve('src/meta.js'), (meta) =>
      meta
        .replace('process.env.VERSION', pkg.version)
        .replace('process.env.AUTHOR', pkg.author),
    ),
  ],
  external: defineExternal([
    '@violentmonkey/ui',
    '@violentmonkey/dom',
    'solid-js',
    'solid-js/web',
  ]),
  output: {
    format: 'iife',
    file: 'dist/index.user.js',
    banner: `(async () => {`,
    footer: `})();`,
    globals: {
      'solid-js': 'await import("https://esm.sh/solid-js")',
      'solid-js/web': 'await import("https://esm.sh/solid-js/web")',
      '@violentmonkey/dom': 'VM',
      '@violentmonkey/ui': 'VM',
    },
    indent: false,
  },
});
