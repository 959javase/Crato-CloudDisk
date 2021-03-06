const productConfig = require('./public/config.json')
const TerserPlugin = require('terser-webpack-plugin')
module.exports = {
  // 选项...
  publicPath: '/',

  //是否开启eslint校验
  lintOnSave: false,

  // optimization: {
  //   minimize: true,
  //   minimizer: [new TerserPlugin()],
  // },

  devServer: {
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 9099,
    proxy: {
      //配置代理，解决跨域请求后台数据的问题
      '/api': {
        // http://192.168.31.156:8080
        // "baseUrl": "http://180.119.121.202:9090"
        // "baseUrl": "http://www.nashcloud.cn/api"
        target: productConfig.baseUrl, //后台接口，连接本地服务
        ws: true, //是否跨域
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/',
        },
      },
    },
  },

  productionSourceMap: false,

  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'stylus',
      patterns: [],
    },
  },
}
