const path = require('path')
const webpack = require("webpack")
const siglePage = require('@haoxh/sigle-page/webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin');
const WebpackBar = require('webpackbar');

module.exports = {
    mode: "development",
    entry: {
        'main_app_xr': path.resolve(__dirname, './../src/common/js/index.js')
    },
    output: {
        path: path.resolve(__dirname, "../dist/"),
        filename: "static/js/[name].js",
        chunkFilename: 'static/js/[name].js',
        publicPath: "",
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    resolve: {
        extensions: ['.js', '.json'],
    },
    target: "web",
    devtool: "source-map",
    watch: true,
    cache: false,
    module: {
        rules: [{
                test: /\.css|less$/,
                exclude: /node_modules/,
                use: [{
                        loader: siglePage.cssLoade
                    },{
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
            }, {
                test: /favicon\.ico$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                    }
                }]
            }, {
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
                    limit: 10000,
                    name: 'static/images/[name].[ext]',
                    publicPath: "/"
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 6000,
                    name: 'static/fonts/[name].[ext]',
                    publicPath: "/"
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
                    loader:siglePage.jsLoade
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-syntax-dynamic-import', "transform-object-assign", '@babel/transform-runtime']
                    }
                }
            }
        ]
    },
    devServer: {
        contentBase: '../dist/',
        hot: true,
        inline: true
    },
    plugins: [
        new WebpackBar(),
        new CleanWebpackPlugin(['dist'], {
            root: path.resolve(__dirname, '../'),
            verbose: true,
            dry: false,
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new ManifestPlugin(),
        new siglePage.Plugin({
          // global:['https://res2.wx.qq.com/open/js/jweixin-1.4.0.js'],
          // globalScript:[path.resolve(__dirname,'../src/common/js/without.js')],
          publicPath:''
        })
        // new OfflinePlugin({
        //     // excludes:['**/*.html', '**/*.json']
        // })
    ]
}