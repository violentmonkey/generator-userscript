module.exports = {
  extends: require.resolve('@gera2ld/plaid/config/babelrc-base'),
  presets: [
<% if (ts) { -%>
    '@babel/preset-typescript',
<% } -%>
  ],
  plugins: [
    ['@babel/plugin-transform-react-jsx', {
      pragma: 'VM.h',
      pragmaFrag: 'VM.Fragment',
    }],
  ],
};
