describe('MockData', function () {
  var FakeObject = require('../lib/object');
  var MockData = require('../lib/mock-data');

  var Person;

  beforeAll(function () {
    Person = FakeObject.extend('Person');
  });

  afterEach(function () {
    MockData.clearData();
  });

  it('should accept a string class name', function () {
    var person = new Person({ name: 'Bob' });
    MockData.setData('Person', [person]);
    expect(MockData.getData('Person')).toEqual([person]);
  });

  it('should accept a FakeObject as class', function () {
    var person = new Person({ name: 'Bob' });
    MockData.setData(Person, [person]);
    expect(MockData.getData(Person)).toEqual([person]);
  });
});
