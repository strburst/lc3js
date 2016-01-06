/**
 * Interpret the given number as a 2's complement integer with numBits bits, and get its real value.
 */
exports.truncate = function(number, numBits) {
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
exports.add = function(a, b, numBits) {
  return exports.truncate(a + b, numBits);
};

/**
 * Fetch the given range of bits, inclusive, and shift the result so that from is the least
 * significant bit.
 */
exports.fetchBits = function(bits, from, to) {
  return (bits >> from) & ~(~0 << (to - from + 1));
};

/**
 * Fetch only the specified bit. Equivalent to fetchBits(value, bit, bit).
 */
var testBit = exports.testBit = function(bits, index) {
  return (bits >> index) & 0x1;
};

/**
 * Construct an integer from the sequence of bits given as strings. Ideal for writing out strings of
 * bits for clarity.
 */
exports.fromBits = function() {
  return parseInt(Array.prototype.join.call(arguments, ''), 2);
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
