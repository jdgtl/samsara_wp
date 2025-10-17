const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build/js'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.jsx', '.js'], // Prioritize .jsx over .js
  },
  externals: {
    // External WordPress dependencies (already loaded by WordPress)
    '@wordpress/element': 'window.wp.element',
    '@wordpress/components': 'window.wp.components',
    '@wordpress/data': 'window.wp.data',
    '@wordpress/api-fetch': 'window.wp.apiFetch',
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
};
