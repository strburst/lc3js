var assert = require('assert');

var assembler = require('../assembler.js');
var misc = require('../misc.js');

var assemblerCases = require('./assemblerCases.js');

describe('bit utilities', function() {
  // Sort individual test cases by operation tested
  assemblerCases = misc.distinctMap(function(item) {
    return item.object.operation;
  }, assemblerCases);

  describe('toInstruction', function() {
    // Test dissassembly for all the previously defined cases
    Object.keys(assemblerCases).forEach(function(operation) {
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
    // TODO: Add custom offsets, derived from the offset field in operation.object
    var nextAddr = 0x4000;
    var labelToAddr = { ARGLABEL: 0x40AA };

    // These instructions take labels as arguments
    var argLabelOps = { BR: true, JSR: true, LD: true, LDI: true, LEA: true, ST: true, STI: true };

    // Test assembly for all the previously defined cases
    Object.keys(assemblerCases).forEach(function(operation) {
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
