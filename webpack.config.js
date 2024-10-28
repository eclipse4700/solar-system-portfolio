const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js', // Entry point of your application
  output: {
    filename: 'bundle.js', // Output bundle file
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Transpile ES6+ code
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/textures', to: 'textures' }, // Copy textures to dist
      ],
    }),
  ],
  resolve: {
    extensions: ['.js'],
    alias: {
      Textures: path.resolve(__dirname, 'dist/textures')
    }
  },
  devtool: 'source-map', // Enable source maps for easier debugging
  mode: 'development', // Set the mode to development
};
