var webpack = require('webpack');
var path = require('path');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var BUILD_DIR = path.resolve(__dirname, 'build');
var APP_DIR = path.resolve(__dirname, 'src');

var config = {
  entry: {
    main: APP_DIR + '/main.js',
    app: APP_DIR + '/app.jsx'
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].js'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.scss$/,
        loader: 'style!css?sourceMap!sass?sourceMap'
      },
      {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]'
      }
    ]
  },
  plugins: [
    new LiveReloadPlugin({appendScriptTag: true}),
    new CopyWebpackPlugin([
      {
        from: APP_DIR + '/package.json'
      }
    ])
  ]
};

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
