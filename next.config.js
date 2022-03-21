const path = require('path')

module.exports = {
  webpack: (config, { isServer }) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        'connected-components': path.resolve('./components/connected-components.js'),
        'wired-up-firebase': path.resolve('./lib/firebase.js'),
        // Avoid duplicate react in libs problem (see
        // https://medium.com/@penx/managing-dependencies-in-a-node-package-so-that-they-are-compatible-with-npm-link-61befa5aaca7)
        // If a better solution arose since this was written then feel
        // free to replace this! :)
        react: path.resolve('./node_modules/react'),
        redux: path.resolve('./node_modules/redux'),
        'react-redux': path.resolve('./node_modules/react-redux'),
        'react-dom': path.resolve('./node_modules/react-dom'),
        automerge: path.resolve('./node_modules/automerge'),
        plottr_import_export: path.resolve('./lib/plottr_import_export/src/index.js'),
        plottr_import_export_config: path.resolve(
          './lib/plottr_import_export/src/exporter/default_config'
        ),
      },
    }

    config.optimization.splitChunks = false

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
