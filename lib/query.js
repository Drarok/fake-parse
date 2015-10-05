var Promise = require('bluebird');

var backbone = require('./backbone');
var MockData = require('./mock-data');

function FakeQuery(objectClass) {
  if (objectClass && objectClass.className) {
    objectClass = objectClass.className;
  }

  this.objectClass = objectClass;

  this.options = {
    limit: 100,
    skip: 0
  };
}

var fakeMethods = [
  'addAscending', 'addDescending', 'ascending', 'containedIn', 'contains', 'containsAll',
  'descending', 'doesNotExist', 'doesNotMatchKeyInQuery', 'doesNotMatchQuery', 'endsWith',
  'equalTo', 'exists', 'greaterThan', 'greaterThanOrEqualTo', 'include', 'lessThan',
  'lessThanOrEqualTo', 'matches', 'matchesKeyInQuery', 'matchesQuery', 'near',
  'notContainedIn', 'notEqualTo', 'or', 'select', 'startsWith', 'withinGeoBox',
  'withinKilometers', 'withinMiles', 'withinRadians'
];

var noop = function () {
  return this;
};

fakeMethods.forEach(function (methodName) {
  FakeQuery.prototype[methodName] = noop;
});

FakeQuery.prototype.count = function (options) {
  var _this = this;

  options = backbone(options);

  return new Promise(function (resolve, reject) {
    resolve(MockData.getData(_this.objectClass).length);
  }).then(options.success, options.error);
};

FakeQuery.prototype.each = function (callback, options) {
  options = backbone(options);

  return this.find()
    .then(function (results) {
      var chain = Promise.resolve();

      results.forEach(function (obj) {
        chain = chain.then(function () {
          return Promise.resolve(callback(obj));
        });
      });

      return chain;
    }).then(options.success, options.error);
};

FakeQuery.prototype.find = function (options) {
  var _this = this;

  options = backbone(options);

  return new Promise(function (resolve, reject) {
    var data = MockData.getData(_this.objectClass);
    resolve(data.slice(_this.options.skip, _this.options.skip + _this.options.limit));
  }).then(options.success, options.error);
};

FakeQuery.prototype.first = function (options) {
  options = backbone(options);

  return this.find()
    .then(function (data) {
      return data[0];
    }).then(options.success, options.error);
};

FakeQuery.prototype.get = function (objectId, options) {
  var _this = this;

  options = backbone(options);

  return new Promise(function (resolve, reject) {
    var data = MockData.getData(_this.objectClass);
    var foundObj;
    data.some(function (obj) {
      if (obj.id === objectId) {
        foundObj = obj;
        return true;
      }
    });
    resolve(foundObj);
  }).then(options.success, options.error);
};

FakeQuery.prototype.limit = function (limit) {
  this.options.limit = limit;
  return this;
};

FakeQuery.prototype.skip = function (skip) {
  this.options.skip = skip;
  return this;
};

/*
_orQuery
include
toJSON
*/

module.exports = FakeQuery;
