const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    main: path.resolve(__dirname, 'src', 'index.js'),
    // vendor: [],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[chunkhash].[name].js',
  },
  resolve: {
    modules: [
      path.join(__dirname, 'src'),
      'node_modules',
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['build']),
    new webpack.optimize.CommonsChunkPlugin({
      names: [
        // 'vendor',
        'manifest'
      ],
    }),
  ],
};
