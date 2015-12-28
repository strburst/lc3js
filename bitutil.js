/**
 * Interpret the given number as a 2's complement integer with numBits bits,
 * and get its real value.
 */
var truncate = exports.truncate = function(number, numBits) {
  numBits = numBits || 16;

  // A bitstring consisting of exactly numBits ones
  var ones = Math.pow(2, numBits) - 1;

  if ((1 << (numBits - 1)) & number) {
    // The last bit is set; sign extend the number
    return number | ~ones;
  } else {
    // Clear all the out-of-range higher-order bits
    return number & ones;
  }
};

/**
 * Add two numbers, then immediately truncate the result.
 */
var add = exports.add = function(a, b, numBits) {
  return truncate(a + b, numBits);
};
