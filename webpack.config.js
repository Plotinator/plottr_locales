const path = require('path')
const webpack = require('webpack')
const packageJSON = require('./package.json')
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')
const isForMaps = process.env.MAPS == 'true'
const sourceMapsPath = path.resolve(__dirname, '..', '..', 'pltr_sourcemaps', packageJSON.version)
const Dotenv = require('dotenv-webpack')
const CircularDependencyPlugin = require('circular-dependency-plugin')

const plugins = [
  new webpack.IgnorePlugin({ resourceRegExp: /main/, contextRegExp: /bin/ }),
  new webpack.DefinePlugin({ __REACT_DEVTOOLS_GLOBAL_HOOK__: '({ isDisabled: true })' }),
  new Dotenv(),
]

const defineConfig = [
  {
    global: {},
  },
]

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// if (process.env.NODE_ENV == 'dev') {
//   plugins.push(new BundleAnalyzerPlugin())
// }

// @ts-ignore
defineConfig.LOGGER = JSON.stringify('false')

if (process.env.NODE_ENV === 'dev' && process.env.LOGGER === 'true') {
  console.log('[Define Plugin] Adding LOGGER to process.env.')
  // @ts-ignore
  defineConfig.LOGGER = JSON.stringify('true')
}

if (process.env.NODE_ENV !== 'dev') {
  // The docs disagree with Typescript here.
  // @ts-ignore
  defineConfig.push({ 'process.env.NODE_ENV': JSON.stringify('production') })
  plugins.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /regenerator|nodent|js-beautify/,
      contextRegExp: /ajv/,
    })
  )
  plugins.push(
    new webpack.SourceMapDevToolPlugin({
      append: `\n//# sourceMappingURL=https://raw.githubusercontent.com/Plotinator/pltr_sourcemaps/${packageJSON.version}/[url]`,
      filename: '[name].bundle.map',
    })
  )
}

// The docs disagree with Typescript here.
// @ts-ignore
plugins.push(new webpack.DefinePlugin(defineConfig))

const mainCircularDependencyChecker = new CircularDependencyPlugin({
  // exclude detection of files based on a RegExp
  exclude: /node_modules/,
  // include specific files based on a RegExp
  include: /main/,
  // add errors to webpack instead of warnings
  failOnError: true,
  // allow import cycles that include an asyncronous import,
  // e.g. via import(/* webpackMode: "weak" */ './file.js')
  allowAsyncCycles: false,
  // set the current working directory for displaying module paths
  cwd: process.cwd(),
})

const duplicateDependencyChecker = new DuplicatePackageCheckerPlugin()

const mainConfig = {
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  watch: process.env.NODE_ENV === 'dev',
  context: path.resolve(__dirname, 'main'),
  entry: {
    main: path.resolve('.', 'main', 'index.js'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'lib', 'pltr', 'v2', 'index.js'),
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: isForMaps ? sourceMapsPath : path.resolve(__dirname, 'bin'),
    filename: '[name].bundle.js',
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: ['node_modules', 'main'],
    alias: {
      'wired-up-pltr': path.resolve(__dirname, 'src', 'wired-up-pltr.js'),
      'plottr_check-prop-types': path.resolve(
        __dirname,
        'lib',
        'plottr_check-prop-types',
        'index.js'
      ),
      plottr_import_export: path.resolve(
        __dirname,
        'lib',
        'plottr_import_export',
        'src',
        'index.js'
      ),
      plottr_locales: path.resolve(__dirname, 'lib', 'plottr_locales', 'src', 'index.js'),
      pltr: path.resolve(__dirname, 'lib', 'pltr', 'v2', 'index.js'),
    },
  },
  target: 'electron-main',
  plugins: [...plugins, duplicateDependencyChecker, mainCircularDependencyChecker],
  devtool: process.env.NODE_ENV === 'dev' ? 'eval' : false,
  node: {
    __dirname: false,
  },
  externals: {
    sharp: 'commonjs sharp',
  },
}

const preloadConfig = {
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  watch: process.env.NODE_ENV === 'dev',
  context: path.resolve(__dirname, 'main'),
  entry: {
    preload: path.resolve('.', 'main', 'modules', 'preload.js'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'lib', 'pltr', 'v2', 'index.js'),
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: isForMaps ? sourceMapsPath : path.resolve(__dirname, 'bin'),
    filename: '[name].bundle.js',
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: ['node_modules', 'main'],
  },
  target: 'electron-main',
  plugins: [...plugins, duplicateDependencyChecker, mainCircularDependencyChecker],
  devtool: process.env.NODE_ENV === 'dev' ? 'eval' : false,
  node: {
    __dirname: false,
  },
}

const appCircularDependencyChecker = new CircularDependencyPlugin({
  // exclude detection of files based on a RegExp
  exclude: /node_modules/,
  // include specific files based on a RegExp
  include: /app/,
  // add errors to webpack instead of warnings
  failOnError: true,
  // allow import cycles that include an asyncronous import,
  // e.g. via import(/* webpackMode: "weak" */ './file.js')
  allowAsyncCycles: false,
  // set the current working directory for displaying module paths
  cwd: process.cwd(),
})

const rendererConfig = {
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  watch: process.env.NODE_ENV === 'dev',
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: path.resolve('.', 'src', 'app', 'index.js'),
    css: path.resolve('.', 'src', 'css', 'index'),
  },
  output: {
    path: isForMaps ? sourceMapsPath : path.resolve(__dirname, 'bin'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'lib', 'pltr', 'v2'),
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'lib', 'plottr_components', 'src'),
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        loader: 'sass-loader',
        include: path.resolve(__dirname, 'lib', 'plottr_components', 'src', 'css'),
      },
      {
        test: /\.scss$/,
        loader: 'sass-loader',
        include: path.resolve(__dirname, 'src', 'css'),
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss', '.json', '.jpg'],
    modules: ['node_modules', 'src/app', 'test'],
    alias: {
      app: path.resolve(__dirname, 'src', 'app'),
      css: path.resolve(__dirname, 'src', 'css'),
      test: path.resolve(__dirname, 'test'),
      'connected-components': path.resolve(__dirname, 'src', 'connected-components.js'),
      'wired-up-firebase': path.resolve(__dirname, 'src', 'wired-up-firebase.js'),
      'wired-up-pltr': path.resolve(__dirname, 'src', 'wired-up-pltr.js'),
      'world-api': path.resolve(__dirname, 'src', 'world.js'),
      // Avoid duplicate react in libs problem (see
      // https://medium.com/@penx/managing-dependencies-in-a-node-package-so-that-they-are-compatible-with-npm-link-61befa5aaca7)
      // If a better solution arose since this was written then feel
      // free to replace this! :)
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react-redux': path.resolve('./node_modules/react-redux'),
      redux: path.resolve('./node_modules/redux'),
      'plottr_check-prop-types': path.resolve(
        __dirname,
        'lib',
        'plottr_check-prop-types',
        'index.js'
      ),
      plottr_components: path.resolve(
        __dirname,
        'lib',
        'plottr_components',
        'src',
        'components',
        'index.js'
      ),
      plottr_firebase: path.resolve(__dirname, 'lib', 'plottr_firebase', 'src', 'index.js'),
      plottr_import_export: path.resolve(
        __dirname,
        'lib',
        'plottr_import_export',
        'src',
        'index.js'
      ),
      plottr_locales: path.resolve(__dirname, 'lib', 'plottr_locales', 'src', 'index.js'),
      plottr_world: path.resolve(__dirname, 'lib', 'plottr_world', 'src', 'index.js'),
      pltr: path.resolve(__dirname, 'lib', 'pltr', 'v2', 'index.js'),
    },
    fallback: {
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      assert: require.resolve('assert/'),
      crypto: require.resolve('crypto-browserify'),
      url: require.resolve('url/'),
    },
  },
  target: 'web',
  plugins: [appCircularDependencyChecker, duplicateDependencyChecker, ...plugins],
  devtool: process.env.NODE_ENV === 'dev' ? 'eval' : false,
  optimization: { splitChunks: false },
  externals: {
    sharp: 'sharp',
  },
}

const loginPopupConfig = {
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  watch: process.env.NODE_ENV === 'dev',
  context: path.resolve(__dirname, 'src'),
  entry: {
    loginApp: path.resolve('.', 'src', 'app', 'login.js'),
    loginCSS: path.resolve('.', 'src', 'css', 'index'),
  },
  output: {
    path: isForMaps ? sourceMapsPath : path.resolve(__dirname, 'bin'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'lib', 'pltr', 'v2', 'index.js'),
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        loader: 'sass-loader',
        include: path.resolve(__dirname, 'src', 'css'),
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss', '.json', '.jpg'],
    modules: ['node_modules', 'src/app', 'test'],
    alias: {
      app: path.resolve(__dirname, 'src', 'app'),
      css: path.resolve(__dirname, 'src', 'css'),
      test: path.resolve(__dirname, 'test'),
      'connected-components': path.resolve(__dirname, 'src', 'connected-components.js'),
      'wired-up-firebase': path.resolve(__dirname, 'src', 'wired-up-firebase.js'),
      'wired-up-pltr': path.resolve(__dirname, 'src', 'wired-up-pltr.js'),
      'world-api': path.resolve(__dirname, 'src', 'world.js'),
      // Avoid duplicate react in libs problem (see
      // https://medium.com/@penx/managing-dependencies-in-a-node-package-so-that-they-are-compatible-with-npm-link-61befa5aaca7)
      // If a better solution arose since this was written then feel
      // free to replace this! :)
      react: path.resolve('./node_modules/react'),
      docx: path.resolve('./node_modules/docx'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react-redux': path.resolve('./node_modules/react-redux'),
      redux: path.resolve('./node_modules/redux'),
      plottr_components: path.resolve(
        __dirname,
        'lib',
        'plottr_components',
        'src',
        'components',
        'index.js'
      ),
      plottr_firebase: path.resolve(__dirname, 'lib', 'plottr_firebase', 'src', 'index.js'),
      plottr_locales: path.resolve(__dirname, 'lib', 'plottr_locales', 'src', 'index.js'),
      pltr: path.resolve(__dirname, 'lib', 'pltr', 'v2', 'index.js'),
    },
  },
  target: 'web',
  plugins: [appCircularDependencyChecker, duplicateDependencyChecker, ...plugins],
  devtool: process.env.NODE_ENV === 'dev' ? 'eval' : false,
  optimization: { splitChunks: false },
  externals: {
    sharp: 'sharp',
  },
}

const localServerConfig = {
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  watch: process.env.NODE_ENV === 'dev',
  context: path.resolve(__dirname, 'main'),
  entry: {
    socketServer: path.resolve('.', 'main', 'server', 'server.js'),
  },
  output: {
    path: isForMaps ? sourceMapsPath : path.resolve(__dirname, 'bin'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'lib', 'pltr', 'v2'),
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: ['main', 'node_modules'],
    alias: {
      docx: path.resolve('./node_modules/docx'),
      plottr_locales: path.resolve(__dirname, 'lib', 'plottr_locales', 'src', 'index.js'),
      pltr: path.resolve(__dirname, 'lib', 'pltr', 'v2', 'index.js'),
    },
  },
  target: 'node',
  plugins: [appCircularDependencyChecker, duplicateDependencyChecker, ...plugins],
  devtool: process.env.NODE_ENV === 'dev' ? 'eval' : false,
  optimization: { splitChunks: false },
  externals: {
    sharp: 'sharp',
  },
}

module.exports = [rendererConfig, mainConfig, preloadConfig, loginPopupConfig, localServerConfig]
