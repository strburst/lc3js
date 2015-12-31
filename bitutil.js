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
