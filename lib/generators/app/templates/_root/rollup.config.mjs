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
    globals: {
      '@violentmonkey/dom': 'VM',
      '@violentmonkey/ui': 'VM',
      // solid-js doesn't provide a UMD bundle, so use the prebuilt version from `@violentmonkey/dom`
      'solid-js': 'VM.solid',
      'solid-js/web': 'VM.solid.web',
    },
    indent: false,
    // If set to false, circular dependencies and live bindings for external imports won't work
    externalLiveBindings: false,
  },
});
