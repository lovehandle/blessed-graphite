var path = require('path');
var fs = require('fs')

var index = {};

fs.readdirSync(
  __dirname
).forEach(function(filename) {
  filename = filename.replace(
    path.extname(filename), ''
  );

  if (!filename.match(/index/)) {
    index[filename] = require(path.join(__dirname, filename + '.js'))
  }
});

module.exports = index;
