const path = require('path')

module.exports = {
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.node = {
        fs: 'empty',
      }
    }

    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: path.resolve(__dirname, 'lib', 'pltr'),
          exclude: /node_modules/,
          query: {
            cacheDirectory: true,
          },
        },
      ],
    }

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        'connected-components': path.resolve('./components/connected-components.js'),
        // Avoid duplicate react in libs problem (see
        // https://medium.com/@penx/managing-dependencies-in-a-node-package-so-that-they-are-compatible-with-npm-link-61befa5aaca7)
        // If a better solution arose since this was written then feel
        // free to replace this! :)
        react: path.resolve('./node_modules/react'),
        redux: path.resolve('./node_modules/redux'),
        'react-redux': path.resolve('./node_modules/react-redux'),
        'react-dom': path.resolve('./node_modules/react-dom'),
      },
    }

    return config
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ]
  },
}
