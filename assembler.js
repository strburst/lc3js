var invert = require('lodash.invert');
var memoize = require('lodash.memoize');
var transform = require('lodash.transform');

var bitutil = require('./bitutil.js');

// Construct tables for converting between opcodes and instruction names
var instructionToOpcode = Object.freeze({
  'ADD': 0x1, 'AND': 0x5, 'BR': 0x0, 'JMP': 0xC, 'JSR': 0x4, 'LD': 0x2, 'LDI': 0xA, 'LDR': 0x6,
  'LEA': 0xE, 'NOT': 0x9, 'RTI': 0x8, 'ST': 0x3, 'STI': 0xB, 'STR': 0x7, 'TRAP': 0xF,
});

var opcodeToInstruction = Object.freeze(invert(instructionToOpcode));

var instructionToMask = Object.freeze(transform(instructionToOpcode, function(acc, code, name) {
  acc[name] = code << 12;
}));

/**
 * Helper function to parse ADD and AND instructions (their bit layouts are the same).
 */
function srcImmediateDecode(name) {
  return function(bits) {
    // ADD/AND instruction: 0001 (opcode) xxx (dr) xxx (sr1) xxxxxx (sr2 or immediate value)
    if (bitutil.testBit(bits, 5)) {
      // Immediate form
      return {
        operation: name,
        destReg: bitutil.fetchBits(bits, 9, 11),
        srcReg1: bitutil.fetchBits(bits, 6, 8),
        immediate: bitutil.fetchBits(bits, 0, 4),
      };
    } else {
      // Register form
      return {
        operation: name,
        destReg: bitutil.fetchBits(bits, 9, 11),
        srcReg1: bitutil.fetchBits(bits, 6, 8),
        srcReg2: bitutil.fetchBits(bits, 0, 2),
      };
    }
  };
}

/**
 * Helper function to parse LD, LDI, LEA, ST, and STI instructions (their bit layouts are the same).
 */
function regOffsetDecode(name) {
  return function(bits) {
    var acc = {
      operation: name,
      register: bitutil.fetchBits(bits, 9, 11),
      offset: bitutil.fetchBits(bits, 0, 8),
    };

    return acc;
  };
}

/**
 * Helper function to parse LDR and STR instructions (their bit layouts are the same).
 */
function baseOffsetDecode(name) {
  return function(bits) {
    return {
      operation: name,
      moveReg: bitutil.fetchBits(bits, 9, 11),
      baseReg: bitutil.fetchBits(bits, 6, 8),
      offset: bitutil.fetchBits(bits, 0, 5),
    };
  };
}

var bitDecoders = Object.freeze({
  'ADD': srcImmediateDecode('ADD'),
  'AND': srcImmediateDecode('AND'),
  'BR': function(bits) {
    return {
      operation: 'BR',
      conditionCode: {
        n: !!bitutil.testBit(bits, 11),
        z: !!bitutil.testBit(bits, 10),
        p: !!bitutil.testBit(bits, 9),
      },
      offset: bitutil.fetchBits(bits, 0, 8),
    };
  },
  'JMP': function(bits) {
    return {
      operation: 'JMP',
      register: bitutil.fetchBits(bits, 6, 8),
    };
  },
  'JSR': function(bits) {
    if (bitutil.testBit(bits, 11)) {
      // True JSR
      return {
        operation: 'JSR',
        offset: bitutil.fetchBits(bits, 0, 10),
      };
    } else {
      // Actually JSRR
      return {
        operation: 'JSR',
        register: bitutil.fetchBits(bits, 6, 8),
      };
    }
  },
  'LD': regOffsetDecode('LD'),
  'LDI': regOffsetDecode('LDI'),
  'LDR': baseOffsetDecode('LDR'),
  'LEA': regOffsetDecode('LEA'),
  'NOT': function(bits) {
    return {
      operation: 'NOT',
      destReg: bitutil.fetchBits(bits, 9, 11),
      srcReg: bitutil.fetchBits(bits, 6, 8),
    };
  },
  // Omitted: RTI
  'ST': regOffsetDecode('ST'),
  'STI': regOffsetDecode('STI'),
  'STR': baseOffsetDecode('STR'),
  // Omitted: TRAP
});

/**
 * Helper function to fetch the opcode of an instruction.
 */
function opcode(bits) {
  return opcodeToInstruction[(bits >> 12) & 0xF];
}

/**
 * Interpret the given bitstring as an instruction and return an object representation of it.
 *
 * This function is memoized, since it's likely to be called on the same bit patterns, e.g. when
 * executing a loop.
 */
exports.toInstruction = memoize(function(bits) {
  return bitDecoders[opcode(bits)](bits);  // Switch on the operation name
});

/**
 * Helper function to assemble ADD and AND instructions (their bit layouts are the same).
 */
function srcImmediateEncode(name) {
  var packRegisterForm = bitutil.bitPacker([
      { name: 'destReg', start: 9, end: 11 },
      { name: 'srcReg1', start: 6, end: 8 },
      { name: 'srcReg2', start: 0, end: 2 },
  ], instructionToMask[name]);

  var packImmediateForm = bitutil.bitPacker([
      { name: 'destReg', start: 9, end: 11 },
      { name: 'srcReg1', start: 6, end: 8 },
      { name: 'immediate', start: 0, end: 4 },
  ], instructionToMask[name] | (1 << 5));

  return function(instruction) {
    if (instruction.immediate) {
      return packImmediateForm(instruction);
    } else {
      return packRegisterForm(instruction);
    }
  };
}

/**
 * Helper function to assemble LD, LDI, LEA, ST, and STI instructions (their bit layouts are the
 * same).
 */
function regLabelEncode(name) {
  var packRegLabel = bitutil.bitPacker([
      { name: 'register', start: 9, end: 11 },
  ], instructionToMask[name]);

  return function(instruction, nextAddr, labelToAddr) {
    var offset = labelToAddr[instruction.argLabel] - nextAddr;
    return packRegLabel(instruction) | offset;
  };
}

/**
 * Helper function to assemble LDR, and STR instructions (their bit layouts are the same).
 */
function baseOffsetEncode(name) {
  return bitutil.bitPacker([
      { name: 'moveReg', start: 9, end: 11 },
      { name: 'baseReg', start: 6, end: 8 },
      { name: 'offset', start: 0, end: 5 },
  ], instructionToMask[name]);
}

var bitEncoders = Object.freeze({
  'ADD': srcImmediateEncode('ADD'),
  'AND': srcImmediateEncode('AND'),
  'BR': (function() {
    // Wrapping ensures that bitPacker only generates a new function once
    var packConditionCode = bitutil.bitPacker([
      { name: 'n', start: 11, end: 11 },
      { name: 'z', start: 10, end: 10 },
      { name: 'p', start: 9, end: 9 },
    ], instructionToMask.BR);

    return function(instruction, nextAddr, labelToAddr) {
      if (!labelToAddr[instruction.argLabel]) {
        return null;
      }

      var cc = packConditionCode(instruction.conditionCode);
      var offset = labelToAddr[instruction.argLabel] - nextAddr;

      return cc | offset;
    };
  })(),
  'JMP': bitutil.bitPacker([
      { name: 'register', start: 6, end: 8 },
  ], instructionToMask.JMP),
  'JSR': (function() {
    var packJSRR = bitutil.bitPacker([
        { name: 'register', start: 6, end: 8 },
    ], instructionToMask.JSR);

    return function(instruction, nextAddr, labelToAddr) {
      if (instruction.register) {
        return packJSRR(instruction);
      } else if (!labelToAddr[instruction.argLabel]) {
        return null;
      } else {
        var offset = labelToAddr[instruction.argLabel] - nextAddr;
        return instructionToMask.JSR | (1 << 11) | offset;
      }
    };
  })(),
  'LD': regLabelEncode('LD'),
  'LDI': regLabelEncode('LDI'),
  'LDR': baseOffsetEncode('LDR'),
  'LEA': regLabelEncode('LEA'),
  'NOT': bitutil.bitPacker([
      { name: 'destReg', start: 9, end: 11 },
      { name: 'srcReg', start: 6, end: 8 },
  ], instructionToMask.NOT | ~(~0 << 6)),
  // Omitted: RTI
  'ST': regLabelEncode('ST'),
  'STI': regLabelEncode('STI'),
  'STR': baseOffsetEncode('STR'),
  // Omitted: TRAP
});

/**
 * Convert an object representation of an instruction (as returned by the parser) to a bitstring.
 * If the current instruction doesn't use labels/offsets, nextAddr and labelToAddr are unused. If
 * labelToAddr doesn't contain a label referenced this instruction, return null.
 *
 * nextAddr refers to the addres of the instruction after this one. In LC-3 assembly, all offsets
 * are relative to the already-incremented program counter.
 */
exports.toBits = function(instruction, nextAddr, labelToAddr) {
  return bitEncoders[instruction.operation](instruction, nextAddr, labelToAddr);
};
