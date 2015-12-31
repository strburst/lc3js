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
  'ADD': addAnd('ADD'),
  'AND': addAnd('AND'),
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
  'LD': drLabelOffset('LD', 'destReg'),
  'LDI': drLabelOffset('LDI', 'destReg'),
  'LDR': ldrStr('LDR'),
  'LEA': drLabelOffset('LEA', 'destReg'),
  'NOT': function(bits) {
    return {
      operation: 'NOT',
      destReg: fetchBits(bits, 9, 11),
      srcReg: fetchBits(bits, 6, 8)
    };
  },
  // Omitted: RTI
  'ST': drLabelOffset('ST', 'srcReg'),
  'STI': drLabelOffset('STI', 'srcReg'),
  'STR': ldrStr('STR'),
  // Omitted: TRAP
});

/**
 * Helper function to parse ADD and AND instructions (their bit layouts are the same).
 */
function addAnd(name, bits) {
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
function drLabelOffset(name, drOrSr, bits) {
  // Man I wish I had currying
  return function(bits) {
    var acc = {
      operation: name,
      offset: fetchBits(bits, 0, 8)
    };
    acc[drOrSr] = fetchBits(bits, 9, 11);

    return acc;
  };
}

/**
 * Helper function to parse LDR and STR instructions (their bit layouts are the same).
 */
function ldrStr(name, bits) {
  return function(bits) {
    return {
      operation: name,
      destReg: fetchBits(bits, 9, 11),
      baseReg: fetchBits(bits, 6, 8),
      offset: fetchBits(bits, 0, 5)
    };
  };
}
