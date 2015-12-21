var assert = require('assert');

var parse = require('../parser.js').parse;

describe('parser', function() {

  describe('overall structure', function() {
    it('should parse a single enclosing block properly', function() {
      var result = parse('.orig x3000\nNOP\n.end');

      assert(Array.isArray(result), 'the overall result is an array of blocks');
      assert.equal(result.length, 1, 'there is only one code block');

      assert.equal(result[0].start, 0x3000, 'start is the correct address');
      assert.equal(result[0].instructions.length, 1, 'block has only one instruction in it');
    });

    it('should parse multiple blocks properly', function() {
      var result = parse('.orig x3000\nNOP\n.end\n.orig x4000\nNOP\n.end');

      assert(Array.isArray(result), 'the overall result is an array of blocks');
      assert.equal(result.length, 2, 'there are two code blocks');

      assert.equal(result[0].start, 0x3000, 'start is the correct address');
      assert.equal(result[0].instructions.length, 1, 'block has only one instruction in it');

      assert.equal(result[1].start, 0x4000, 'start is the correct address');
      assert.equal(result[1].instructions.length, 1, 'block has only one instruction in it');
    });
  });

});
