#!/usr/bin/env node
/* eslint no-console:0 */

var fs = require('fs');
var util = require('util');

var parse = require('./parser').parse;

// Parse command-line arguments into a convenient object representation
var argv = require('yargs')
  .usage('Usage: ./$0 [options] file')
  .demand(1, 1, 'Need a file to process')

  .option('color', {
    describe: 'whether to use color output (can be true, false, or default); default is to give ' +
      'color output if writing to a terminal',
    default: 'default',
    type: 'string',
  })

  .option('parse-tree', {
    describe: 'output the parse tree instead of compiled Javascript',
    type: 'boolean',
  })

  .help('h')
  .alias('h', 'help')
  .argv;

var fileName = argv._[0];
var parseTree = parse(fs.readFileSync(fileName).toString());

if (argv['parse-tree']) {  // --parse-tree flag given; output the parse tree
  var inspectOpts = {
    // Color output if outputting to a TTY, or 'color' option explicitly set
    colors: process.stdout.isTTY && argv.color !== 'false' || argv.color === 'true',
    depth: 4,
  };

  console.log(util.inspect(parseTree, inspectOpts));
  process.exit(0);
}
