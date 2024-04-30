module.exports = {
  presets: [
    ['@babel/preset-react', { useBuiltIns: true }],
    ['@babel/preset-env', { modules: false, targets: { node: true } }],
  ],
  plugins: [
    'lodash',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-modules-commonjs',
    [
      'module-resolver',
      {
        alias: {
          plottr_locales: './lib/plottr_locales/src',
          plottr_components: './lib/plottr_components/src/components',
          pltr: './lib/pltr/v2',
        },
      },
    ],
  ],
}
