var colors = ['red', 'yellow', 'blue', 'green', 'magenta', 'white'];

module.exports = {
  bind: function (func, binding) {
    return function () {
      return func.apply(binding, arguments);
    }
  },
  each: function (obj, cb) {
    for (var i = 0; i < obj.length; i++) {
      cb(i, obj[i]);
    }
  },
  randomColor: function () {
    return colors[Math.floor( Math.random() * colors.length )];
  }
}

