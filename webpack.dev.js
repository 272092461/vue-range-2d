const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

// dev config
const dev = {

  // Paths
  assetsSubDirectory: 'static',
  assetsPublicPath: '/',
  proxyTable: {},

  // Various Dev Server settings
  host: 'localhost', // can be overwritten by process.env.HOST
  port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
  autoOpenBrowser: false,
  errorOverlay: true,
  notifyOnErrors: true,
  poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

  // Use Eslint Loader?
  // If true, your code will be linted during bundling and
  // linting errors and warnings will be shown in the console.
  useEslint: false,
  // If true, eslint errors and warnings will also be shown in the error overlay
  // in the browser.
  showEslintErrorsInOverlay: false,

  /**
   * Source Maps
   */

  // https://webpack.js.org/configuration/devtool/#development
  devtool: 'cheap-module-eval-source-map',

  // If you have problems debugging vue-files in devtools,
  // set this to false - it *may* help
  // https://vue-loader.vuejs.org/en/options.html#cachebusting
  cacheBusting: true,

  cssSourceMap: true
}

const devWebpack = {
  context: __dirname,
  entry: './src/main.js',
  output: {
    // 输出文件，路径相对于本文件所在的位置
    path: path.resolve(__dirname, './static/js/'),
    // 基于文件的md5生成Hash名称的script来防止缓存
    filename: '[name].[hash].js',
    // 非主入口的文件名，即未被列在entry中，却又需要被打包出来的文件命名配置
    chunkFilename: '[id].[chunkhash].js'
  },
  devtool: dev.devtool,
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || dev.host,
    port: PORT || dev.port,
    open: dev.autoOpenBrowser,
    overlay: dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: dev.assetsPublicPath,
    proxy: dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: 'development'
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, './static'),
        to: dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ],
  module: {
    rules: [
      {test: /\.vue$/, use: 'vue-loader'},
      {test: /\.js$/, use: 'babel-loader'}
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpack.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpack.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpack)
    }
  })
})