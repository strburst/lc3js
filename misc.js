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

/**
 * Create a new object that sorts the given array of objects by all the distinct values that the
 * key fKey has. If purge is truthy, also remove the given key from all objects.
 *
 * Note that all objects are shallow copied into the new map.
 *
 * If the given key is a function, evaluate the function and use that as if it were the result of
 * the key lookup instead. (purge will be ignored in this case.)
 */
exports.distinctMap = function(fKey, objects, purge) {
  return objects.reduce(function(map, object) {
    var value = _.isFunction(fKey)
      ? fKey(object)
      : object[fKey];

    if (!map[value]) {
      // This is the first item with this value
      map[value] = [object];
    } else {
      map[value].push(object);
    }

    if (purge && !_.isFunction(fKey)) {
      delete object[fKey];
    }

    return map;
  }, {});
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
