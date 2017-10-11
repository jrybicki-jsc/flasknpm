const path = require('path');

module.exports = {
  entry: './src/my.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'static')
  }
};

