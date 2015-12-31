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
