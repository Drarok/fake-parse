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

      var complete = jasmine.createSpy('complete');

      query
        .each(callback)
        .then(complete);

      var delayedPromise = function (delay) {
        return new Promise(function (resolve, reject) {
          setTimeout(resolve, delay);
        });
      };

      Promise.resolve()
        .then(function () {
          // We haven't let the event loop get a look in yet, nothing should have been run.
          expect(callback).not.toHaveBeenCalled();
          expect(complete).not.toHaveBeenCalled();
          return delayedPromise(10);
        }).then(function () {
          // Thanks to the delay, callback should now have been called - but not complete.
          expect(callback.calls.count()).toBe(1);
          expect(complete).not.toHaveBeenCalled();
          resolveCurrentCallback();
          resolveCurrentCallback = null;
          return delayedPromise(10);
        }).then(function () {
          // How callback will have been called a second time, but we're waiting for it to return
          // before complete should be called.
          expect(callback.calls.count()).toBe(2);
          expect(complete).not.toHaveBeenCalled();
          resolveCurrentCallback();
          resolveCurrentCallback = null;
          return delayedPromise(10);
        }).then(function () {
          // Now callback has returned, complete should have been called.
          expect(complete).toHaveBeenCalled();
        }).then(done, done.fail);
    });
  });

  describe('count', function () {
    beforeEach(function () {
      MockData.setData('Person', [
        new Person({ name: 'Sideshow Bob' }),
        new Person({ name: 'Sideshow Mel' })
      ]);
    });

    it('should count all objects', function (done) {
      query.count()
        .then(function (count) {
          expect(count).toEqual(2);
        }).then(done, done.fail);
    });

    it('should ignore limit and skip', function (done) {
      query
        .limit(1)
        .skip(2)
        .count()
        .then(function (count) {
          expect(count).toEqual(2);
        }).then(done, done.fail);
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
        }).then(done, done.fail);
    });
  });

  describe('get', function () {
    beforeEach(function () {
      MockData.setData('Person', [
        new Person({ id: 'person-bob', name: 'Sideshow Bob' }),
        new Person({ id: 'person-mel', name: 'Sideshow Mel' })
      ]);
    });

    it('should return undefined if no such object', function (done) {
      query
        .get('person-none')
        .then(function (person) {
          expect(person).toBe(undefined);
        }).then(done, done.fail);
    });

    it('should return object when valid id given', function (done) {
      query
        .get('person-bob')
        .then(function (person) {
          expect(person).toEqual(jasmine.any(Person));
          expect(person.get('name')).toEqual('Sideshow Bob');
        }).then(done, done.fail);
    });

    it('should ignore limit and skip', function (done) {
      query
        .limit(1)
        .skip(2)
        .get('person-bob')
        .then(function (person) {
          expect(person).toEqual(jasmine.any(Person));
          expect(person.get('name')).toEqual('Sideshow Bob');
        }).then(done, done.fail);
    });
  });
  });
});
