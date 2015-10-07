describe('FakeACL', function () {
  var FakeACL = require('../lib/acl');
  var FakeUser = require('../lib/user');

  var user;
  var baseACL;

  beforeEach(function () {
    user = new FakeUser({ id: 'fake-user-1' });
    baseACL = new FakeACL(user);
  });

  describe('equals', function () {
    it('should return false for empty ACL', function () {
      var acl = new FakeACL();
      expect(baseACL.equals(acl)).toBe(false);
    });

    it('should return false for ACL with different access', function () {
      var acl = new FakeACL();
      acl.setReadAccess(user, true);
      expect(baseACL.equals(acl)).toBe(false);
    });

    it('should return true for same object', function () {
      expect(baseACL.equals(baseACL)).toBe(true);
    });

    it('should return true for ACL created with same user', function () {
      var acl = new FakeACL(user);
      expect(baseACL.equals(acl)).toBe(true);
    });

    it('should return true for ACL with same user added', function () {
      var acl = new FakeACL();
      acl.setReadAccess(user, true);
      acl.setWriteAccess(user, true);
      expect(baseACL.equals(acl)).toBe(true);
    });

    xit('should return true for ACLs with only same roles', function () {
      // TODO
    });
  });

  describe('setPublicReadAccess', function () {
    it('should store the value given', function () {
      var values = [true, false];

      values.forEach(function (v) {
        baseACL.setPublicReadAccess(v);
        expect(baseACL.getPublicReadAccess()).toBe(v);
      });
    });
  });

  describe('setPublicWriteAccess', function () {
    it('should store the value given', function () {
      var values = [true, false];

      values.forEach(function (v) {
        baseACL.setPublicWriteAccess(v);
        expect(baseACL.getPublicWriteAccess()).toBe(v);
      });
    });
  });

  describe('setReadAccess', function () {
    it('should store the value given against a userId', function () {
      var id = 'user-xyz';

      var values = [true, false];

      values.forEach(function (v) {
        baseACL.setReadAccess(id, v);
        expect(baseACL.getReadAccess(id)).toBe(v);
      });
    });

    it('should store the value given against a user object', function () {
      var values = [true, false];

      values.forEach(function (v) {
        baseACL.setReadAccess(user, v);
        expect(baseACL.getReadAccess(user)).toBe(v);
      });
    });

    xit('should store the value given against a role object', function () {
      // TODO
    });
  });

  describe('setRoleReadAccess', function () {
    xit('should store the value given against a role object', function () {
      // TODO
    });
  });

  describe('setRoleWriteAccess', function () {
    xit('should store the value given against a role object', function () {
      // TODO
    });
  });

  describe('setWriteAccess', function () {
    it('should store the value given against a userId', function () {
      var id = 'user-xyz';

      var values = [true, false];

      values.forEach(function (v) {
        baseACL.setWriteAccess(id, v);
        expect(baseACL.getWriteAccess(id)).toBe(v);
      });
    });

    it('should store the value given against a user object', function () {
      var values = [true, false];

      values.forEach(function (v) {
        baseACL.setWriteAccess(user, v);
        expect(baseACL.getWriteAccess(user)).toBe(v);
      });
    });

    xit('should store the value given against a role object', function () {
      // TODO
    });
  });

  describe('toJSON', function () {
    var expectedObject = {
      userAccess: {
        'fake-user-1': {
          read: true,
          write: true
        }
      },
      roleAccess: {}
    };

    it('should return an object', function () {
      expect(baseACL.toJSON()).toEqual(expectedObject);
    });

    it('should be used by JSON.stringify()', function () {
      expect(JSON.stringify(baseACL)).toEqual(JSON.stringify(expectedObject));
    });
  });
});
