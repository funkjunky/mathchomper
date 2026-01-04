var path = require('path');

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(png|svg|jpg|gif|wav|mp3)$/,
        use: ['file-loader'],
      },
    ]
  },
  resolve: {
    extensions: ['.*', '.js', '.png'],
    alias: {
      assets: path.resolve(__dirname, 'assets'),
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    static: './dist',
  },
};
