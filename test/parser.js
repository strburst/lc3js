var assert = require('assert');

var parse = require('../parser.js').parse;

describe('parser', function() {

  /** Wrap code in boilerplate .orig and .end pseudo-ops. */
  function wrapCode(code) {
    return '.orig x3000\n' + code + '\n.end';
  }

  describe('overall structure', function() {
    it('should parse a single enclosing block properly', function() {
      var result = parse(wrapCode('NOP'));

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

  describe('instructions', function() {
    describe('AND', function() {
      it('should parse a basic AND instruction properly (immediate form)', function() {
        var result = parse(wrapCode('AND R0, R1, 2'));

        assert.deepEqual(result[0].instructions[0], {
          operation: 'AND',
          destReg: 0,
          srcReg: 1,
          immediate: 2
        });
      });

      it('should parse a basic AND instruction properly (register form)', function() {
        var result = parse(wrapCode('AND R0, R1, R2'));

        assert.deepEqual(result[0].instructions[0], {
          operation: 'AND',
          destReg: 0,
          srcReg1: 1,
          srcReg2: 2
        });
      });
    });

    describe('LD', function() {
      it('should parse a basic LD instruction properly', function() {
        var result = parse(wrapCode('LD R0, LABEL'));

        assert.deepEqual(result[0].instructions[0], {
          operation: 'LD',
          destReg: 0,
          fromLabel: 'LABEL'
        });
      });
    });

    describe('LDR', function() {
      it('should parse a basic LDR instruction properly', function() {
        var result = parse(wrapCode('LDR R0, R1, 2'));

        assert.deepEqual(result[0].instructions[0], {
          operation: 'LDR',
          destReg: 0,
          baseReg: 1,
          offset: 2
        });
      });
    });

    describe('NOT', function() {
      it('should parse a basic NOT instruction properly', function() {
        var result = parse(wrapCode('NOT R0, R1'));

        assert.deepEqual(result[0].instructions[0], {
          operation: 'NOT',
          destReg: 0,
          srcReg: 1
        });
      });
    });

    describe('ST', function() {
      it('should parse a basic NOT instruction properly', function() {
        var result = parse(wrapCode('ST R0, LABEL'));

        assert.deepEqual(result[0].instructions[0], {
          operation: 'ST',
          destReg: 0,
          intoLabel: 'LABEL'
        });
      });
    });
  });

});
