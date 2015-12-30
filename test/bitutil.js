var assert = require('assert');

var bitutil = require('../bitutil.js');

describe('bit utilities', function() {
  describe('truncate', function() {
    it('shouldn\'t change normal numbers', function() {
      assert.equal(bitutil.truncate(parseInt('0110', 2), 16), 6, 'case where number wasn\'t ' +
          'truncated');
      assert.equal(bitutil.truncate(parseInt('1010', 2), 16), 10, 'case where number wasn\'t ' +
          'truncated');
    });

    it('should sign extend based on the leading bit', function() {
      assert.equal(bitutil.truncate(parseInt('0110', 2), 4), 6, 'case where leading bit was 0');
      assert.equal(bitutil.truncate(parseInt('1010', 2), 4), -6, 'case where leading bit was 1');
    });

    it('should ignore higher order bits', function() {
      assert.equal(bitutil.truncate(parseInt('10100110', 2), 4), 6, 'case where new leading bit ' +
          'was 0');
      assert.equal(bitutil.truncate(parseInt('10101010', 2), 4), -6, 'case where new leading bit ' +
          'was 1');
    });

    it('should handle edge cases', function() {
      assert.equal(bitutil.truncate(parseInt('10000', 2), 4), 0, 'given range has only zeroes');
      assert.equal(bitutil.truncate(parseInt('01111', 2), 4), -1, 'given range has only ones');
    });
  });
});

