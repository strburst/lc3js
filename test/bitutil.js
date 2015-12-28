var assert = require('assert');

var bitutil = require('../bitutil.js');

describe('bitwise utilities', function() {
  describe('truncate', function() {
    it('shouldn\'t change normal numbers', function() {
      assert.equal(bitutil.truncate(12), 12);
      assert.equal(bitutil.truncate(-12), -12);
    });

    it('should truncate big numbers properly', function() {
      assert.equal(bitutil.truncate(16, 4), 0);
      assert.equal(bitutil.truncate(15, 4), -1);
    });
  });
});

