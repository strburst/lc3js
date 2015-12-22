var warningTable = {
  'exec data': {
    longName: 'execution of data',
    explanation: 'A memory cell previously marked as an instruction has ' +
      'been executed.'
  },

  'self-modifying': {
    longName: 'self-modifying code',
    explanation: 'A memory cell previously marked as an instruction has ' +
      'been modified by the program.'
  },

  'read uninitd': {
    longName: 'reading uninitialized memory',
    explanation: 'A memory cell whose value was not previously set by the ' +
      'program or implicitly defined as a service routine has been read'
  }
};

exports.warn = function(warningName) {
  warning = warningTable[warningName];

  console.warn('Warning: ' + warning.longName + '\n');
  console.warn(warning.explanation);
};
