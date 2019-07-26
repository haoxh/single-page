
const path = require('path')
const siglePage = require('@haoxh/sigle-page/webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const WebpackBar = require('webpackbar');
const OfflinePlugin = require('offline-plugin');

module.exports = {
  mode: "production",
  entry: {
    'main_app_xr': path.resolve(__dirname, './../src/common/js/index.js')
  },
  output: {
    path: path.resolve(__dirname, "../dist/"),
    filename: "static/js/[name].[chunkhash:8].js",
    chunkFilename: 'static/js/[name].[chunkhash:8].js',
    publicPath: "",
  },
  optimization: {
    splitChunks: {
      chunks: 'all',

    }
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  target: "web",
  devtool: "nosources-source-map",
  module: {
    rules: [
      {
        test: /\.((css)|(less))$/,
        exclude: /node_modules/,
        use: [
          {
            loader: siglePage.cssLoader
          }, {
            loader: 'css-loader'
          }, {
            loader: 'less-loader'
          }, {
            loader: 'postcss-loader',
            options: {
              plugins: [require("autoprefixer")({
                browsers: ["iOS >= 6", "Android > 4.4"]
              })]
            }
          }
        ]
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            context: path.resolve(__dirname, './../src/pages/'),
            outputPath: function (fileName) {
              return fileName && fileName.replace(/^(.+\/)/, '')
            },
          }
        }, {
          loader: 'extract-loader',
        }, {
          loader: 'html-loader',
          options: {
            ignoreCustomFragments: [/\{\{.*?\}\}/],
            attrs: ['img:src', 'img:data-src', 'audio:src'],
            minimize: true
          }
        }]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1000,
          name: 'static/images/[name]_[hash:8].[ext]',
          publicPath: ""
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1000,
          name: 'static/fonts/[name]_[hash:8].[ext]',
          publicPath: ""
        }
      },
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader"
      },
      {
        test: /index_page(_.+)?\.js$/,
        exclude: /node_modules/,
        use: {
          loader: siglePage.jsLoader
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-syntax-dynamic-import', "transform-object-assign", '@babel/transform-runtime'],
          }
        }
      },

    ]
  },
  plugins: [
    new WebpackBar(),
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '../'),
      verbose: true,
      dry: false,
    }),
    new ManifestPlugin(),
    new OptimizeCSSAssetsPlugin({
      cssProcessor: require('cssnano'), //引入cssnano配置压缩选项
      cssProcessorOptions: {
        discardComments: { removeAll: true }
      },
      canPrint: true //是否将插件信息打印到控制台
    }),
    new siglePage.Plugin({
      // global: ['https://res2.wx.qq.com/open/js/jweixin-1.4.0.js'],
      // globalScript: [path.resolve(__dirname, '../src/common/js/without.js')],
      publicPath: '',
      build: process.env.NODE_ENV === 'production'
    }),
    new OfflinePlugin({
      excludes: ['**/*.html', '**/*.json']
    })
  ]
}