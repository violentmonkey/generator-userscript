module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      loose: true,
    }],
    '@babel/preset-typescript',
    'babel-preset-solid',
  ],
};
