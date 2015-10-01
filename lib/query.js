var Promise = require('bluebird');

var backbone = require('./backbone');
var MockData = require('./mock-data');

function FakeQuery(objectClass) {
  if (objectClass && objectClass.className) {
    objectClass = objectClass.className;
  }

  this.objectClass = objectClass;
}

var fakeMethods = [
  'addAscending', 'addDescending', 'ascending', 'containedIn', 'contains', 'containsAll',
  'descending', 'doesNotExist', 'doesNotMatchKeyInQuery', 'doesNotMatchQuery', 'endsWith',
  'equalTo', 'exists', 'greaterThan', 'greaterThanOrEqualTo', 'include', 'lessThan',
  'lessThanOrEqualTo', 'limit', 'matches', 'matchesKeyInQuery', 'matchesQuery', 'near',
  'notContainedIn', 'notEqualTo', 'or', 'select', 'skip', 'startsWith', 'withinGeoBox',
  'withinKilometers', 'withinMiles', 'withinRadians'
];

var noop = function () {
  return this;
};

fakeMethods.forEach(function (methodName) {
  FakeQuery.prototype[methodName] = noop;
});

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
    resolve(MockData.getData(_this.objectClass));
  }).then(options.success, options.error);
};

/*
_orQuery
addAscending
addDescending
ascending
containedIn
contains
containsAll
count
descending
doesNotExist
doesNotMatchKeyInQuery
doesNotMatchQuery
each
endsWith
equalTo
exists
find
first
get
greaterThan
greaterThanOrEqualTo
include
lessThan
lessThanOrEqualTo
limit
matches
matchesKeyInQuery
matchesQuery
near
notContainedIn
notEqualTo
or
select
skip
startsWith
toJSON
withinGeoBox
withinKilometers
withinMiles
withinRadians
*/

module.exports = FakeQuery;
