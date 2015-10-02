var util = require('util');

var Promise = require('bluebird');

/*
 * We have to alter the Promise prototype, else chaining won't work.
 */

Promise.prototype.always = Promise.prototype.finally;
Promise.prototype.done = Promise.prototype.then;
Promise.prototype.fail = Promise.prototype.error;

function FakePromise(resolver) {
  var _this = this;

  var fakeResolver = function (resolve, reject) {
    _this.resolve = resolve;
    _this.reject = reject;
    if (resolver) {
      resolver.call(_this, resolve, reject);
    }
  };

  // Major hack to let us subclass Promise from Bluebird.
  var _constructor = this.constructor;
  this.constructor = Promise;
  Promise.call(this, fakeResolver);
  this.constructor = _constructor;
}

util.inherits(FakePromise, Promise);

/* Static methods */

FakePromise.as = Promise.resolve;

FakePromise.error = Promise.reject;

FakePromise.is = function (obj) {
  return !!(obj && obj.then);
};

FakePromise.when = function () {
  var args = Array.prototype.slice.call(arguments);

  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }

  var p = Promise.all(args);
  p.then = p.spread;
  return p;
};

module.exports = FakePromise;
