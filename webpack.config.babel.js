import { resolve } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  mode: isProduction ? 'production' : 'development',
  context: resolve(__dirname, 'src'),
  entry: [
    './scripts/app.js',
  ],
  output: {
    filename: 'app.js',
    path: resolve(__dirname),
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
  ],
};

export default config;
