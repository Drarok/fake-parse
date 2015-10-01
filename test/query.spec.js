var Promise = require('bluebird');

describe('FakeQuery', function () {
  var FakeObject = require('../lib/object');
  var FakeQuery = require('../lib/query');

  var MockData = require('../lib/mock-data');

  var Person;

  beforeAll(function () {
    Person = FakeObject.extend('Person');
  });

  var query;

  beforeEach(function () {
    query = new FakeQuery(Person);
  });

  afterEach(function () {
    MockData.clearData();
  });

  describe('chainable methods', function () {
    it('should have no effect', function () {
      var chained = query
        .addAscending()
        .addDescending()
        .ascending();

      expect(chained).toBe(query);
    });
  });

  describe('each', function () {
    it('should call back for each object', function (done) {
      MockData.setData('Person', [
        new Person({ name: 'Sideshow Bob' }),
        new Person({ name: 'Sideshow Mel' })
      ]);

      var callback = jasmine.createSpy('callback');

      query
        .each(callback)
        .then(function () {
          expect(callback.calls.count()).toBe(2);
          done();
        }, done.fail);
    });

    /* It would be nice to use jasmine.clock() for this test, but that breaks Bluebird. */
    it('should wait for Promises from the callback', function (done) {
      MockData.setData('Person', [
        new Person({ name: 'Sideshow Bob' }),
        new Person({ name: 'Sideshow Mel' })
      ]);

      var resolveCurrentCallback;
      var callback = jasmine.createSpy('callback');
      callback.and.callFake(function () {
        return new Promise(function (resolve, reject) {
          resolveCurrentCallback = resolve;
        });
      });

      var completed = jasmine.createSpy('completed');

      query
        .each(callback)
        .then(completed);

      expect(callback).not.toHaveBeenCalled();
      expect(completed).not.toHaveBeenCalled();

      setTimeout(function () {
        resolveCurrentCallback();
        expect(callback.calls.count()).toBe(1);
        expect(completed).not.toHaveBeenCalled();
      }, 10);

      setTimeout(function () {
        resolveCurrentCallback();
        expect(callback.calls.count()).toBe(2);
      }, 20);

      setTimeout(function () {
        expect(completed).toHaveBeenCalled();
        done();
      }, 30);
    });
  });

  describe('find', function () {
    var people;

    beforeEach(function () {
      people = [
        new Person({ name: 'Sideshow Bob' }),
        new Person({ name: 'Sideshow Mel' })
      ];
      MockData.setData('Person', people);

      var Other = FakeObject.extend('Other');
      MockData.setData('Other', [
        new Other({ name: 'other1' })
      ]);
    });

    it('should return only its fake data', function (done) {
      query.find()
        .then(function (data) {
          expect(data.length).toBe(2);
          expect(data[0]).toBe(people[0]);
          expect(data[1]).toBe(people[1]);
          done();
        }, done.fail);
    });
  });
});
