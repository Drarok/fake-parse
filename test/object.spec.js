describe('FakeObject', function () {
  var FakeObject = require('../lib/object');
  var MockData = require('../lib/mock-data');

  var Person;

  beforeAll(function () {
    var protoProps = {
      getAge: function () {
        return this.get('age');
      }
    };

    var classProps = {
      SOME_CLASS_PROP: 100
    };

    Person = FakeObject.extend('Person', protoProps, classProps);
  });

  var person;

  beforeEach(function () {
    person = new Person({ age: 100 });
  });

  afterEach(function () {
    MockData.clearData();
  });

  describe('extend', function () {
    it('should set class properties', function () {
      expect(Person.SOME_CLASS_PROP).toBe(100);
    });

    it('should return an instance of FakeObject', function () {
      var instance = new Person();
      expect(instance).toEqual(jasmine.any(FakeObject));
    });

    it('should set the className', function () {
      var instance = new Person();
      expect(instance.className).toBe('Person');
    });

    it('should set prototype properties', function () {
      var instance = new Person({ age: 100 });
      expect(instance.getAge()).toBe(100);
    });
  });

  describe('clone', function () {
    it('should copy properties', function () {
      var person2 = person.clone();
      expect(person2.get('age')).toBe(100);
    });
  });

  describe('dirty', function () {
    it('should return false for unset attributes', function () {
      expect(person.dirty('age')).toBe(false);
    });

    it('should return true once an attribute is set', function () {
      person.set('age', 200);
      expect(person.dirty('age')).toBe(true);
      expect(person.get('age')).toBe(200);
    });
  });

  describe('dirtyKeys', function () {
    it('should return no keys initially', function () {
      expect(person.dirtyKeys()).toEqual([]);
    });

    it('should return a key once the attribute is set', function () {
      person.set('age', 200);
      expect(person.dirtyKeys()).toEqual(['age']);
    });
  });

  describe('fetch', function () {
    it('should reject if no such object', function (done) {
      MockData.setData('Person', []);

      Person.createWithoutData('123abc')
        .fetch()
        .then(function (data) {
          done.fail('Should not receive data' + data.toString());
        }, function (err) {
          expect(err.message).toEqual('Object with id 123abc not found');
          done();
        });
    });

    it('should resolve if the object exists', function (done) {
      person.id = '123abc';
      person.set('name', 'Sideshow Bob');
      MockData.setData('Person', [person]);

      Person.createWithoutData('123abc')
        .fetch()
        .then(function (data) {
          expect(data.id).toBe(person.id);
          expect(data.get('name')).toEqual('Sideshow Bob');
          done();
        }, function (err) {
          done.fail(err.message);
        });
    });
  });

  describe('save', function () {
    it('should generate an id', function (done) {
      person.set('name', 'Sideshow Bob');
      person.save()
        .then(function (saved) {
          expect(saved.id).not.toBe(undefined);
          done();
        }, function (err) {
          done.fail(err.message);
        });
    });

    it('should store itself in MockData', function (done) {
      person.save()
        .then(function (saved) {
          expect(MockData.getData('Person').length).toBe(1);
          done();
        }, done.fail);
    });

    it('should accept attributes', function (done) {
      person.save({ name: 'Sideshow Bob' })
        .then(function (saved) {
          expect(saved).toBe(person);
          expect(saved.get('name')).toEqual('Sideshow Bob');
        }, function (err) {
          done.fail(err.message);
        }).then(done);
    });


    it('should accept attributes and options', function (done) {
      var options = {
        success: function (saved) {
          expect(saved).toBe(person);
          expect(saved.get('name')).toEqual('Sideshow Bob');
        }
      };

      person.save({ name: 'Sideshow Bob' }, options)
        .then(function (saved) {
          expect(saved).toBe(person);
          expect(saved.get('name')).toEqual('Sideshow Bob');
        }, function (err) {
          done.fail(err.message);
        }).then(done);
    });
  });
});
