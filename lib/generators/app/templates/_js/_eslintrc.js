module.exports = {
  root: true,
  extends: [
    require.resolve('@gera2ld/plaid/eslint'),
    'plugin:prettier/recommended',
  ],
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
    react: {
      pragma: 'VM',
    },
  },
  globals: {
    VM: true,
  },
};
