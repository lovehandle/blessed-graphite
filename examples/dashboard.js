var blessed  = require('blessed');
var contrib  = require('blessed-contrib');
var graphite = require('../index');
var utils = require('../lib/utils');
var dashboard = require('./dashboard.json');

var screen = blessed.screen();
var grid = new contrib.grid({
  rows: 24, cols: 24, screen: screen
});

var client = new graphite.client({
  host: process.env.GRAPHITE_URL,
  user: process.env.GRAPHITE_USER,
  password: process.env.GRAPHITE_PASSWORD 
});

utils.each(dashboard, function (i, item) {
  var widget  = grid.set(item.row, item.col, item.height, item.width, contrib[item.type], item.style);
  var dataset = new graphite.dataset(client, item.data);
  graphite.render(screen, widget, dataset);
})
