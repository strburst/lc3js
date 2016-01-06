var assert = require('assert');
var _ = require('underscore');

var assembler = require('../assembler.js');
var bitutil = require('../bitutil.js');
var misc = require('../misc.js');

describe('bit utilities', function() {
  // Test cases for assembly and dissasembly
  var assemblerCases = [
    {
      binary: bitutil.fromBits('0001', '110', '001', '0', '00', '010'),
      message: 'typical ADD (register form)',
      object: {
        operation: 'ADD',
        destReg: 6,
        srcReg1: 1,
        srcReg2: 2,
      },
    },
    {
      binary: bitutil.fromBits('0001', '101', '001', '1', '10101'),
      message: 'typical ADD (immediate form)',
      object: {
        operation: 'ADD',
        destReg: 5,
        srcReg1: 1,
        immediate: 21,
      },
    },
    {
      binary: bitutil.fromBits('0101', '110', '001', '0', '00', '010'),
      message: 'typical AND (register form)',
      object: {
        operation: 'AND',
        destReg: 6,
        srcReg1: 1,
        srcReg2: 2,
      },
    },
    {
      binary: bitutil.fromBits('0101', '101', '001', '1', '10101'),
      message: 'typical AND (immediate form)',
      object: {
        operation: 'AND',
        destReg: 5,
        srcReg1: 1,
        immediate: 21,
      },
    },
    {
      binary: 0xAA,
      message: 'typical BR',
      object: {
        operation: 'BR',
        conditionCode: { n: false, z: false, p: false },
        offset: 0xAA,
      },
    },
    {
      binary: bitutil.fromBits('1100', '000', '101', '000000'),
      message: 'typical JMP',
      object: {
        operation: 'JMP',
        register: 5,
      },
    },
    {
      binary: bitutil.fromBits('0100', '1', '00010101010'),
      message: 'typical JSR',
      object: {
        operation: 'JSR',
        offset: 0xAA,
      },
    },
    {
      binary: bitutil.fromBits('0100', '0', '00', '101', '000000'),
      message: 'typical JSRR',
      object: {
        operation: 'JSR',
        register: 5,
      },
    },
  ];

  // Sort individual test cases by operation tested
  assemblerCases = misc.distinctMap(function(item) {
    return item.object.operation;
  }, assemblerCases);

  describe('toInstruction', function() {
    // Test dissassembly for all the previously defined cases
    _.keys(assemblerCases).forEach(function(operation) {
      it('should disassemble ' + operation + ' instructions', function() {
        assemblerCases[operation].forEach(function(testCase) {
          assert.deepEqual(assembler.toInstruction(testCase.binary), testCase.object,
              testCase.message);
        });
      });
    });
  });

  describe('toBits', function() {
    // Pass these parameters in every test (thus all offsets will be 0xAA)
    var nextAddr = 0x4000;
    var labelToAddr = { ARGLABEL: 0x40AA };

    // These instructions take labels as arguments
    var argLabelOps = { BR: true, JSR: true, LD: true, LEA: true, ST: true, STI: true };

    // Test assembly for all the previously defined cases
    _.keys(assemblerCases).forEach(function(operation) {
      it('should assemble ' + operation + ' instructions', function() {
        assemblerCases[operation].forEach(function(testCase) {
          // Annotate this instruction with a label argument if it requires one
          var object = argLabelOps[operation]
            ? Object.assign({}, { argLabel: 'ARGLABEL' }, testCase.object)
            : testCase.object;

          assert.deepEqual(assembler.toBits(object, nextAddr, labelToAddr), testCase.binary,
              testCase.message);
        });
      });
    });
  });
});
