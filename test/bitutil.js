var assert = require('assert');

var bitutil = require('../bitutil.js');

describe('bit utilities', function() {
  describe('truncate', function() {
    it('shouldn\'t change normal numbers', function() {
      assert.equal(bitutil.truncate(parseInt('0110', 2), 16), 6, 'number wasn\'t truncated');
      assert.equal(bitutil.truncate(parseInt('1010', 2), 16), 10, 'number wasn\'t truncated');
    });

    it('should sign extend based on the leading bit', function() {
      assert.equal(bitutil.truncate(parseInt('0110', 2), 4), 6, 'leading bit was 0');
      assert.equal(bitutil.truncate(parseInt('1010', 2), 4), -6, 'leading bit was 1');
    });

    it('should ignore higher order bits', function() {
      assert.equal(bitutil.truncate(parseInt('10100110', 2), 4), 6, 'new leading bit was 0');
      assert.equal(bitutil.truncate(parseInt('10101010', 2), 4), -6, 'new leading bit was 1');
    });

    it('should handle edge cases', function() {
      assert.equal(bitutil.truncate(parseInt('10000', 2), 4), 0, 'given range has only zeroes');
      assert.equal(bitutil.truncate(parseInt('01111', 2), 4), -1, 'given range has only ones');
    });
  });

  describe('fetchBits', function() {
    it('should fetch single bits', function() {
      assert.equal(bitutil.fetchBits(parseInt('110100', 2), 2, 2), 0x1);
      assert.equal(bitutil.fetchBits(parseInt('110100', 2), 1, 1), 0x0);
    });

    it('should fetch typical ranges', function() {
      assert.equal(bitutil.fetchBits(parseInt('110100', 2), 2, 4), parseInt('101', 2));
      assert.equal(bitutil.fetchBits(parseInt('110100', 2), 2, 5), parseInt('1101', 2));
      assert.equal(bitutil.fetchBits(parseInt('110100', 2), 0, 2), parseInt('100', 2));
    });

    it('should fetch ranges in edge cases', function() {
      assert.equal(bitutil.fetchBits(0x0, 3, 10), 0, 'number was zero');
      assert.equal(bitutil.fetchBits(~0x0, 3, 10), 0xFF, 'number was all ones');
    });
  });

  describe('testBit', function() {
    it('should return single bits', function() {
      assert.equal(bitutil.testBit(parseInt('110100', 2), 0), 0x0);
      assert.equal(bitutil.testBit(parseInt('110100', 2), 1), 0x0);
      assert.equal(bitutil.testBit(parseInt('110100', 2), 2), 0x1);
      assert.equal(bitutil.testBit(parseInt('110100', 2), 3), 0x0);
      assert.equal(bitutil.testBit(parseInt('110100', 2), 4), 0x1);
      assert.equal(bitutil.testBit(parseInt('110100', 2), 5), 0x1);
    });

    it('should return the correct bit in edge cases', function() {
      assert.equal(bitutil.testBit(0x0, 0), 0x0, 'number and index both zero');
      assert.equal(bitutil.testBit(0x1, 0), 0x1, 'number is one and index is zero');

      assert.equal(bitutil.testBit(0x2, 5), 0x0, 'index is large than number');
    });
  });

  describe('bitPacker', function() {
    it('should pack single-bit fields properly', function() {
      var pack = bitutil.bitPacker([
          { name: 'a', start: 1, end: 1 },
          { name: 'b', start: 3, end: 3 },
          { name: 'c', start: 4, end: 4 },
          { name: 'd', start: 7, end: 7 },
      ], parseInt('01100101', 2));

      assert.equal(pack({ a: 1, b: 1, c: 1, d: 1 }), 0xFF);
      assert.equal(pack({ a: 0, b: 0, c: 1, d: 1 }), 0xF5);
      assert.equal(pack({ a: 0, b: 0, c: 0, d: 0 }), 0x65);
    });

    it('should pack beginning/ending ranges properly', function() {
      var pack = bitutil.bitPacker([
          { name: 'a', start: 0, end: 4 },
          { name: 'b', start: 8, end: 12 },
      ], 0x0F0);

      assert.equal(pack({a: 0xF, b: 0xF}), 0xFFF);
      assert.equal(pack({a: 0x9, b: 0x9}), 0x9F9);
      assert.equal(pack({a: 0x0, b: 0x0}), 0x0F0);
    });

    it('should return initial if fields is empty', function() {
      assert.equal(bitutil.bitPacker([], 0xDEADBEEF)({}), 0xDEADBEEF);
    });
  });
});

