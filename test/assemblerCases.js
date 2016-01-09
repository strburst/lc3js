var bitutil = require('../bitutil.js');

// Test cases for assembly and dissasembly
module.exports = [
  {
    // Correct assembled representation
    binary: bitutil.fromBits('0001', '110', '001', '0', '00', '010'),
    // Message passed to assert.equal
    message: 'typical ADD (register form)',
    // Correct disassembled representation
    object: {
      operation: 'ADD',
      destReg: 6,
      srcReg1: 1,
      srcReg2: 2,
    },
  },
  {
    binary: bitutil.fromBits('0001', '101', '001', '1', '10101'),
    message: 'typical ADD (immediate form)',
    object: {
      operation: 'ADD',
      destReg: 5,
      srcReg1: 1,
      immediate: 21,
    },
  },
  {
    binary: bitutil.fromBits('0101', '110', '001', '0', '00', '010'),
    message: 'typical AND (register form)',
    object: {
      operation: 'AND',
      destReg: 6,
      srcReg1: 1,
      srcReg2: 2,
    },
  },
  {
    binary: bitutil.fromBits('0101', '101', '001', '1', '10101'),
    message: 'typical AND (immediate form)',
    object: {
      operation: 'AND',
      destReg: 5,
      srcReg1: 1,
      immediate: 21,
    },
  },
  {
    binary: 0xAA,
    message: 'typical BR',
    object: {
      operation: 'BR',
      conditionCode: { n: false, z: false, p: false },
      offset: 0xAA,
    },
  },
  {
    binary: bitutil.fromBits('1100', '000', '101', '000000'),
    message: 'typical JMP',
    object: {
      operation: 'JMP',
      register: 5,
    },
  },
  {
    binary: bitutil.fromBits('0100', '1', '00010101010'),
    message: 'typical JSR',
    object: {
      operation: 'JSR',
      offset: 0xAA,
    },
  },
  {
    binary: bitutil.fromBits('0100', '0', '00', '101', '000000'),
    message: 'typical JSRR',
    object: {
      operation: 'JSR',
      register: 5,
    },
  },
  {
    binary: bitutil.fromBits('0010', '101', '010101010'),
    message: 'typical LD',
    object: {
      operation: 'LD',
      offset: 0xAA,
      register: 5,
    },
  },
  {
    binary: bitutil.fromBits('1010', '101', '010101010'),
    message: 'typical LDI',
    object: {
      operation: 'LDI',
      offset: 0xAA,
      register: 5,
    },
  },
  {
    binary: bitutil.fromBits('0110', '101', '010', '101010'),
    message: 'typical LDR',
    object: {
      operation: 'LDR',
      moveReg: 5,
      baseReg: 2,
      offset: 0x2A,
    },
  },
  {
    binary: bitutil.fromBits('1110', '101', '010101010'),
    message: 'typical LEA',
    object: {
      operation: 'LEA',
      offset: 0xAA,
      register: 5,
    },
  },
  {
    binary: bitutil.fromBits('1001', '101', '010', '111111'),
    message: 'typical NOT',
    object: {
      operation: 'NOT',
      destReg: 5,
      srcReg: 2,
    },
  },
  {
    binary: bitutil.fromBits('0011', '101', '010101010'),
    message: 'typical ST',
    object: {
      operation: 'ST',
      offset: 0xAA,
      register: 5,
    },
  },
  {
    binary: bitutil.fromBits('1011', '101', '010101010'),
    message: 'typical STI',
    object: {
      operation: 'STI',
      offset: 0xAA,
      register: 5,
    },
  },
  {
    binary: bitutil.fromBits('0111', '101', '010', '101010'),
    message: 'typical STR',
    object: {
      operation: 'STR',
      moveReg: 5,
      baseReg: 2,
      offset: 0x2A,
    },
  },
];
