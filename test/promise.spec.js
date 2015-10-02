describe('FakePromise', function () {
  var FakePromise = require('../lib/promise');

  beforeEach(function () {
  });

  describe('always', function () {
    it('should be called on resolve', function (done) {
      var p = new FakePromise(function (resolve, reject) {
        resolve(true);
      });

      var alwaysCallback = jasmine.createSpy('alwaysCallback');

      p.always(alwaysCallback)
        .then(function () {
          expect(alwaysCallback).toHaveBeenCalled();
        })
        .then(done, done.fail);
    });

    it('should be called on reject', function (done) {
      var p = new FakePromise(function (resolve, reject) {
        reject(new Error('Deliberate rejection'));
      });

      var alwaysCallback = jasmine.createSpy('alwaysCallback');
      var noop = jasmine.createSpy('noop');

      p.fail(noop)
        .always(alwaysCallback)
        .always(function () {
          expect(noop).toHaveBeenCalled();
          expect(alwaysCallback).toHaveBeenCalled();
          done();
        });
    });

    describe('as', function () {
      it('should pass through plain values', function (done) {
        FakePromise.as(true)
          .then(function (result) {
            expect(result).toBe(true);
            done();
          });
      });

      it('should resolve promises', function (done) {
        var p = FakePromise.as(true);
        FakePromise.as(p)
          .then(function (result) {
            expect(result).toBe(true);
            done();
          });
      });
    });
  });

  describe('done', function () {
    it('should receive the resolved value', function (done) {
      var p = FakePromise.as(true);
      p.done(function (result) {
        expect(result).toBe(true);
        done();
      });
    });
  });

  describe('error', function () {
    it('should return a rejected Promise', function (done) {
      FakePromise.error(new Error('Deliberate rejection'))
        .fail(function (err) {
          expect(err).toEqual(jasmine.any(Error));
          expect(err.message).toEqual('Deliberate rejection');
          done();
        });
    });
  });

  describe('is', function () {
    it('should identify rejected thenables', function () {
      var p = FakePromise.error(new Error('Deliberate rejection')).fail(function () {});
      expect(FakePromise.is(p)).toBe(true);
    });

    it('should identify resolved thenables', function () {
      var p = FakePromise.as(true);
      expect(FakePromise.is(p)).toBe(true);
    });

    it('should identify unresolved thenables', function () {
      var p = new FakePromise(function () {});
      expect(FakePromise.is(p)).toBe(true);
    });
  });

  describe('reject', function () {
    it('should reject the Promise', function (done) {
      var p = new FakePromise();
      p.fail(function (err) {
        expect(err).toEqual(jasmine.any(Error));
        expect(err.message).toEqual('Deliberate rejection');
        done();
      });

      p.reject(new Error('Deliberate rejection'));
    });
  });

  describe('resolve', function () {
    it('should resolve the Promise', function (done) {
      var p = new FakePromise();
      p.then(function (result) {
        expect(result).toBe(true);
        done();
      });

      p.resolve(true);
    });
  });

  describe('then', function () {
    it('should receive resolved value', function (done) {
      var p = new FakePromise();
      p.then(function (result) {
        expect(result).toBe(true);
        done();
      });

      p.resolve(true);
    });

    it('should receive rejected error', function (done) {
      var p = new FakePromise();
      p.then(function (result) {
      }, function (err) {
        expect(err).toEqual(jasmine.any(Error));
        expect(err.message).toEqual('Deliberate rejection');
        done();
      });

      p.reject(new Error('Deliberate rejection'));
    });
  });

  describe('when', function () {
    it('should accept variable number of arguments', function (done) {
      FakePromise.when(true, true, false)
        .then(function (a, b, c) {
          expect(a).toBe(true);
          expect(b).toBe(true);
          expect(c).toBe(false);
          done();
        });
    });

    it('should resolve variable number of Promises', function (done) {
      var p1 = FakePromise.as(true);
      var p2 = FakePromise.as(true);
      var p3 = FakePromise.as(false);

      FakePromise.when(p1, p2, p3)
        .then(function (a, b, c) {
          expect(a).toBe(true);
          expect(b).toBe(true);
          expect(c).toBe(false);
          done();
        });
    });

    it('should accept an array of values', function (done) {
      FakePromise.when([true, true, false])
        .then(function (a, b, c) {
          expect(a).toBe(true);
          expect(b).toBe(true);
          expect(c).toBe(false);
          done();
        });
    });

    it('should resolve an array of Promises', function (done) {
      var p1 = FakePromise.as(true);
      var p2 = FakePromise.as(true);
      var p3 = FakePromise.as(false);

      FakePromise.when([p1, p2, p3])
        .then(function (a, b, c) {
          expect(a).toBe(true);
          expect(b).toBe(true);
          expect(c).toBe(false);
          done();
        });
    });
  });
});
