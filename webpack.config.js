const path = require('path')
const vueLoaderConfig = require('./build/vue-loader.conf.js')
const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'vue-range-2d.js',
    library: 'vue-range-2d',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {test: /\.js$/, use: 'babel-loader'},
      {test: /\.css$/, use: 'style-loader!css-loader!auto'}
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {     //压缩代码
        dead_code: true,    //移除没被引用的代码
        warnings: false,     //当删除没有用处的代码时，显示警告
        loops: true //当do、while 、 for循环的判断条件可以确定是，对其进行优化
      },
      except: ['$super', '$', 'exports', 'require']    //混淆,并排除关键字
    })
  ]
}