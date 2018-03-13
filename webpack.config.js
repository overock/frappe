/* global __dirname */

var path = require('path');

var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var dir_js = path.resolve(__dirname, 'js');
var dir_html = path.resolve(__dirname, 'html');
var dir_dev = path.resolve(__dirname, 'dev');

var dir_build = path.resolve(__dirname, 'build');
module.exports = {
  entry: {
    index: path.resolve(dir_dev, 'index.js'),
    frappe: [ path.resolve(dir_js, 'frappe.js') ]
  },
  output: {
    path: dir_build,
    filename: '[name].js'
  },
  devServer: {
    contentBase: dir_build,
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        test: dir_js
      },
      {
        loader: 'babel-loader',
        test: dir_dev
      },
      {
        test: dir_html
      }
    ]
  },
  plugins: [
    // Simply copies the files over
    new CopyWebpackPlugin([
      { from: dir_html } // to: output.path
    ]),
    // Avoid publishing files when compilation fails
    new webpack.NoErrorsPlugin()
  ],
  stats: {
    // Nice colored output
    colors: true
  },
  // Create Sourcemaps for the bundle
  devtool: 'source-map',
};
