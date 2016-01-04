var assert = require('assert');

var parse = require('../parser.js').parse;

describe('parser', function() {
  /** Wrap code in boilerplate .orig and .end pseudo-ops. */
  function wrapCode(code) {
    return '.orig x3000\n' + code + '\n.end';
  }

  describe('overall structure', function() {
    it('should parse a single enclosing block', function() {
      var result = parse(wrapCode('NOP'));

      assert(Array.isArray(result), 'the overall result is an array of blocks');
      assert.equal(result.length, 1, 'there is only one code block');

      assert.equal(result[0].start, 0x3000, 'start is the correct address');
      assert.equal(result[0].instructions.length, 1, 'block has only one instruction in it');
    });

    it('should parse multiple blocks', function() {
      var result = parse('.orig x3000\nNOP\n.end\n.orig x4000\nNOP\n.end');

      assert(Array.isArray(result), 'the overall result is an array of blocks');
      assert.equal(result.length, 2, 'there are two code blocks');

      assert.equal(result[0].start, 0x3000, 'start is the correct address');
      assert.equal(result[0].instructions.length, 1, 'block has only one instruction in it');

      assert.equal(result[1].start, 0x4000, 'start is the correct address');
      assert.equal(result[1].instructions.length, 1, 'block has only one instruction in it');
    });
  });

  describe('instructions', function() {
    it('should parse a basic AND instruction (immediate form)', function() {
      var result = parse(wrapCode('AND R0, R1, 2'));

      assert.deepEqual(result[0].instructions[0], {
        operation: 'AND',
        destReg: 0,
        srcReg: 1,
        immediate: 2,
      });
    });

    it('should parse a basic AND instruction (register form)', function() {
      var result = parse(wrapCode('AND R0, R1, R2'));

      assert.deepEqual(result[0].instructions[0], {
        operation: 'AND',
        destReg: 0,
        srcReg1: 1,
        srcReg2: 2,
      });
    });

    it('should parse a basic LD instruction', function() {
      var result = parse(wrapCode('LD R0, LABEL'));

      assert.deepEqual(result[0].instructions[0], {
        operation: 'LD',
        register: 0,
        argLabel: 'LABEL',
      });
    });

    it('should parse a basic LDR instruction', function() {
      var result = parse(wrapCode('LDR R0, R1, 2'));

      assert.deepEqual(result[0].instructions[0], {
        operation: 'LDR',
        moveReg: 0,
        baseReg: 1,
        offset: 2,
      });
    });

    it('should parse a basic NOT instruction', function() {
      var result = parse(wrapCode('NOT R0, R1'));

      assert.deepEqual(result[0].instructions[0], {
        operation: 'NOT',
        destReg: 0,
        srcReg: 1,
      });
    });

    it('should parse a basic NOT instruction', function() {
      var result = parse(wrapCode('ST R0, LABEL'));

      assert.deepEqual(result[0].instructions[0], {
        operation: 'ST',
        register: 0,
        argLabel: 'LABEL',
      });
    });
  });
});
