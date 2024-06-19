const [
  // @ts-ignore
  _rendererConfig,
  // @ts-ignore
  _mainConfig,
  // @ts-ignore
  _preloadConfig,
  // @ts-ignore
  _loginPopupConfig,
  // @ts-ignore
  socketServerConfig,
] = require('./webpack.config')

module.exports = [socketServerConfig]
