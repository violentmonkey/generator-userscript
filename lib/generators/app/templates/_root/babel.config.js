module.exports = {
  extends: require.resolve('@gera2ld/plaid/config/babelrc-base'),
  presets: [
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-transform-react-jsx', {
      pragma: 'VM.h', // use 'VM.hm' if you don't need SVG support and don't want to call VM.m
      pragmaFrag: 'VM.Fragment',
    }],
  ],
};
