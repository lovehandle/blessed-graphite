var utils = require('../utils');

module.exports.transform = function (dataset, data) {
  var results = [];

  utils.each(data, function (i, series) {
    var xs = [], ys = [];

    utils.each(series.datapoints, function (j, datapoint) {
      xs.push( datapoint[1] );
      ys.push( datapoint[0] );
    });

    results.push({
      x: xs, y: ys, style: { line: dataset.getColor(i) }
    })
  });

  return results;
}
