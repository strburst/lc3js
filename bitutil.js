var _ = require('underscore');

/**
 * Interpret the given number as a 2's complement integer with numBits bits, and get its real value.
 */
var truncate = exports.truncate = function(number, numBits) {
  numBits = numBits || 16;

  // A bitstring where the first numBits bits are zeroes, and all other bits are ones
  var zeroes = ~0 << numBits;

  if ((1 << (numBits - 1)) & number) {
    // The last bit is set; sign extend the number
    return number | zeroes;
  } else {
    // Clear all the out-of-range higher-order bits
    return number & ~zeroes;
  }
};

/**
 * Add two numbers, then immediately truncate the result.
 */
var add = exports.add = function(a, b, numBits) {
  return truncate(a + b, numBits);
};

/**
 * Fetch the given range of bits, inclusive, and shift the result so that from is the least
 * significant bit.
 */
var fetchBits = exports.fetchBits = function(bits, from, to) {
  return (bits >> from) & ~(~0 << (to - from + 1));
};

/**
 * Fetch only the specified bit. Equivalent to fetchBits(value, bit, bit).
 */
var testBit = exports.testBit = function(bits, index) {
  return (bits >> index) & 0x1;
};

/**
 * Take an array of field objects, with name, start, and end properties (inclusive), and return a
 * function that bitpacks the properties in the object passed as an argument. initial is the
 * bitstring to start from; if not given, it is zero.
 */
var bitPacker = exports.bitPacker = function(fields, initial) {
  return function(values) {
    return fields.reduce(function(acc, field) {
      var rangeLen = field.end - field.start + 1;
      var truncated = values[field.name] & ~(~0 << rangeLen);

      return acc | (truncated << field.start);
    }, initial);
  };
};

// Construct tables for converting between opcodes and instruction names
var instructionToOpcode = Object.freeze({
 'ADD': 0x1, 'AND': 0x5, 'BR': 0x0, 'JMP': 0xC, 'JSR': 0x4, 'JSRR': 0x4, 'LD': 0x2, 'LDI': 0xA,
 'LDR': 0x6, 'LEA': 0xE, 'NOT': 0x9, 'RET': 0xC, 'RTI': 0x8, 'ST': 0x3, 'STI': 0xB, 'STR': 0x7,
 'TRAP': 0xF,
});

var opcodeToInstruction = Object.freeze(_.invert(instructionToOpcode));

var instructionToMask = Object.freeze(_.mapObject(instructionToOpcode, function(opcode) {
  return opcode << 12;
}));

var maskToInstruction = Object.freeze(_.invert(instructionToMask));

/**
 * Interpret the given bitstring as an instruction and return an object representation of it.
 *
 * This function is memoized, since it's likely to be called on the same bit patterns, e.g. when
 * executing a loop.
 */
var toInstruction = exports.toInstruction = _.memoize(function(bits) {
  return bitDecoders[opcode(bits)](bits);  // Switch on the operation name
});

/**
 * Helper function to fetch the opcode of an instruction.
 */
function opcode(bits) {
  return opcodeToInstruction[(bits >> 12) & 0xF];
}

var bitDecoders = Object.freeze({
  'ADD': srcImmediateDecode('ADD'),
  'AND': srcImmediateDecode('AND'),
  'BR': function(bits) {
    return {
      operation: 'BR',
      conditionCode: {
        n: !!testBit(bits, 11),
        z: !!testBit(bits, 10),
        p: !!testBit(bits, 9)
      },
      offset: fetchBits(bits, 0, 8)
    };
  },
  'JMP': function(bits) {
    return {
      operation: 'JMP',
      register: fetchBits(bits, 6, 8)
    };
  },
  'JSR': function(bits) {
    if (testBit(bits, 11)) {
      // True JSR
      return {
        operation: 'JSR',
        offset: fetchBits(bits, 0, 10)
      };
    } else {
      // Actually JSRR
      return {
        operation: 'JSR',
        register: fetchBits(bits, 6, 8)
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
      destReg: fetchBits(bits, 9, 11),
      srcReg: fetchBits(bits, 6, 8)
    };
  },
  // Omitted: RTI
  'ST': regOffsetDecode('ST'),
  'STI': regOffsetDecode('STI'),
  'STR': baseOffsetDecode('STR'),
  // Omitted: TRAP
});

/**
 * Helper function to parse ADD and AND instructions (their bit layouts are the same).
 */
function srcImmediateDecode(name, bits) {
  return function(bits) {
    // ADD/AND instruction: 0001 (opcode) xxx (dr) xxx (sr1) xxxxxx (sr2 or immediate value)
    if (testBit(bits, 5)) {
      // Immediate form
      return {
        operation: name,
        destReg: fetchBits(bits, 9, 11),
        srcReg1: fetchBits(bits, 6, 8),
        immediate: fetchBits(bits, 0, 4)
      };
    } else {
      // Register form
      return {
        operation: name,
        destReg: fetchBits(bits, 9, 11),
        srcReg1: fetchBits(bits, 6, 8),
        srcReg2: fetchBits(bits, 0, 2)
      };
    }
  };
}

/**
 * Helper function to parse LD, LDI, LEA, ST, and STI instructions (their bit layouts are the same).
 */
function regOffsetDecode(name, bits) {
  // Man I wish I had currying
  return function(bits) {
    var acc = {
      operation: name,
      register: fetchBits(bits, 9, 11),
      offset: fetchBits(bits, 0, 8)
    };

    return acc;
  };
}

/**
 * Helper function to parse LDR and STR instructions (their bit layouts are the same).
 */
function baseOffsetDecode(name, bits) {
  return function(bits) {
    return {
      operation: name,
      moveReg: fetchBits(bits, 9, 11),
      baseReg: fetchBits(bits, 6, 8),
      offset: fetchBits(bits, 0, 5)
    };
  };
}

/**
 * Convert an object representation of an instruction (as returned by the parser) to a bitstring.
 * If the current instruction doesn't use labels/offsets, nextAddr and labelToAddr are unused. If
 * labelToAddr doesn't contain a label referenced this instruction, return null.
 *
 * nextAddr refers to the addres of the instruction after this one. In LC-3 assembly, all offsets
 * are relative to the already-incremented program counter.
 */
var toBits = exports.toBits = function(instruction, nextAddr, labelToAddr) {
  return bitEncoders[instruction.operation](instruction, nextAddr, labelToAddr);
};

var bitEncoders = Object.freeze({
  'ADD': srcImmediateEncode('ADD'),
  'AND': srcImmediateEncode('AND'),
  'BR': function() {
    // Wrapping ensures that bitPacker only generates a new function once
    var packConditionCode = bitPacker([
      { name: 'n', start: 11, end: 11 },
      { name: 'z', start: 10, end: 10 },
      { name: 'p', start: 9, end: 9 },
    ], instructionToMask.BR);

    return function(instruction, nextAddr, labelToAddr) {
      if (!labelToAddr[instruction.gotoLabel]) {
        return null;
      }

      var cc = packConditionCode(instruction.conditionCode);
      var offset = labelToAddr[instruction.gotoLabel] - nextAddr;

      return cc | offset;
    };
  }(),
  'JMP': bitPacker([
      { name: 'register', start: 6, end: 8 }
  ], instructionToMask.JMP),
  'JSR': function() {
    var packJSRR = bitPacker([
        { name: 'register', start: 6, end: 8 }
    ], instructionToMask.JSR);

    return function(instruction, nextAddr, labelToAddr) {
      if (instruction.register) {
        return packJSRR(instruction);
      } else if (!labelToAddr[instruction.gotoLabel]) {
        return null;
      } else {
        var offset = labelToAddr[instruction.gotoLabel] - nextAddr;
        return instructionToMask.JSR | (1 << 11) | offset;
      }
    };
  },
  'LD': regLabelEncode('LD'),
  'LDI': regLabelEncode('LDI'),
  'LDR': baseOffsetEncode('LDR'),
  'LEA': regLabelEncode('LEA'),
  'NOT': bitPacker([
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
 * Helper function to assemble ADD and AND instructions (their bit layouts are the same).
 */
function srcImmediateEncode(name) {
  var packRegisterForm = bitPacker([
      { name: 'destReg', start: 9, end: 11 },
      { name: 'srcReg1', start: 6, end: 8 },
      { name: 'srcReg2', start: 0, end: 2 },
  ], instructionToMask[name]);

  var packImmediateForm = bitPacker([
      { name: 'destReg', start: 9, end: 11 },
      { name: 'srcReg', start: 6, end: 8 },
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
  return function(instruction, nextAddr, labelToAddr) {
    var offset = labelToAddr[instruction.argLabel] - nextAddr;
    return instructionToMask[name] | instruction.moveReg | offset;
  };
}

/**
 * Helper function to assemble LDR, and STR instructions (their bit layouts are the same).
 */
function baseOffsetEncode(name) {
  return bitPacker([
      { name: 'moveReg', start: 9, end: 11 },
      { name: 'baseReg', start: 6, end: 8 },
      { name: 'offset', start: 0, end: 5 },
  ], instructionToMask[name]);
}
