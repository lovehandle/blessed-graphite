var https = require('https');
var querystring = require('querystring');
var utils = require('./lib/utils')
var transformers = require('./lib/transformers')

var Client = function () {
  this.initialize.apply(this, arguments);
}

Client.defaults = {
  "protocol": "https",
  "host": null,
  "path": '/render',
  "user": null,
  "password": null,
  "port": 443,
  "method": "GET"
}

Client.prototype.initialize = function (options) {
  options = options || {};

  for (key in this.constructor.defaults) {
    this[key] = options[key] || this.constructor.defaults[key];
  }

  return this;
};

Client.prototype.get = function (query, onSuccess, onError) {
  query = query || {};

  var options = {
    hostname: this.host,
    port: this.port,
    path: this.path + '?' + querystring.stringify(query),
    method: this.method,
  }

  if (this.user || this.password) {
    options['auth'] = this.user + ':' + this.password;
  }

  var req = https.request(options, function (res) {
    var data = '';

    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end', function () {
      onSuccess(JSON.parse(data));
    });
  });

  req.end();

  req.on('error', function (e) {
    onError(e)
  });
}

var Dataset = function () {
  this.initialize.apply(this, arguments);
}

Dataset.defaults = {
  from: '-1h',
  until: 'now',
  target: [],
  refresh: 5000,
  format: 'json',
  colors: []
}

Dataset.prototype.initialize = function (client, options) {
  options = options || {};

  for (var key in this.constructor.defaults) {
    this[key] = options[key] || this.constructor.defaults[key];
  }

  var self = this;

  this._client = client;
  this._interval = setInterval(function () { self.sync }, this.refresh);
  this._events = {};

  this.sync();
}

Dataset.prototype.toQuery = function () {
  var date = new Date();
  return {
    from: this.from,
    until: this.until,
    target: this.target,
    format: 'json',
    _timestamp: date.getTime()
  };
}

Dataset.prototype.sync = function () {
  var self = this;
  this._client.get(
    this.toQuery(),
    function (data) { self.trigger('update', data) },
    function (error) { self.trigger('error', error) }
  );
}

Dataset.prototype.on = function (e, callback) {
  this._events[e] = this._events[e] || [];
  this._events[e].push(callback);
  return this;
}

Dataset.prototype.trigger = function (e) {
  var events = this._events[e] || [];
  for (var i = 0; i < events.length; i++) {
    events[i].apply(null, Array.prototype.slice.call(arguments, 1));
  }
  return this;
}

Dataset.prototype.getColor = function (i) {
  this.colors[i] = this.colors[i] || utils.randomColor();
  return this.colors[i];
}

exports.client = Client
exports.dataset = Dataset

exports.render = function (screen, widget, dataset, options) {
  dataset.on('update', function (data) {
    var transformer = transformers[widget.type];

    if (typeof transformer === 'undefined') {
      throw 'Widget type not supported: ' + widget.type;
    }

    widget.setData( transformer.transform(dataset, data) );
    screen.render();
  });
}
