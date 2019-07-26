
const webpack = require("webpack")
const config = require("../config/webpack.dev.conf")
const webpackDevServer = require('webpack-dev-server');
const ip = require('./localIpv4')

const options = {
  contentBase: '../dist',
  hot: true,
  host: '0.0.0.0',
  watchContentBase: true,
  disableHostCheck:true,
  open: true,
  openPage: '/home.html',
  // https: true,
  after: function() {
    let color = ['\x1B[1m',  '\x1B[22m'].join('%s')
    console.log(color,`ip address at: http://${ip}:5000/home.html`);
    console.log(color,`local address at: http://localhost:5000/home.html`);
  },
  stats: {
    colors: true
  }
};

webpackDevServer.addDevServerEntrypoints(config, options);
const compiler = webpack(config);
const server = new webpackDevServer(compiler, options);

server.listen(5000);
