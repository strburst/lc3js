var _ = require('underscore');

/**
 * Return the least and greatest numbers a 2's complement sequence of n bits can represent.
 */
exports.bitRange = _.memoize(function(bits) {
  var pow = Math.pow(2, bits - 1);
  return {
    min: -pow,
    max: pow - 1
  };
});

/**
 * Test if n can be represented by a 2's complement integer with the given number of bits.
 */
exports.inBitRange = function(n, bits) {
  var range = exports.bitRange(bits);
  return n >= range.min && n <= range.max;
};

var warningTable = {
  'exec data': {
    longName: 'execution of data',
    explanation: 'A memory cell previously marked as an instruction has been executed.'
  },

  'self-modifying': {
    longName: 'self-modifying code',
    explanation: 'A memory cell previously marked as an instruction has been modified by the ' +
      'program.'
  },

  'read uninitd': {
    longName: 'reading uninitialized memory',
    explanation: 'A memory cell whose value was not previously set by the program or implicitly ' +
      'defined as a service routine has been read.'
  }
};

exports.warn = function(warningName) {
  warning = warningTable[warningName];

  console.warn('Warning: ' + warning.longName + '\n');
  console.warn(warning.explanation);
};
