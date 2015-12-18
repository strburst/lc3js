#!/usr/bin/env node

// Parse command-line arguments into a convenient object representation
var argv = require('yargs')
  .usage('Usage: ./$0 [options] file')
  .demand(1, 1, 'Need a file to process')

  .option('p', {
      alias: 'parse',
      describe: 'Output the parse tree instead of compiled Javascript',
      type: 'boolean'
  })

  .help('h')
  .alias('h', 'help')
  .argv;
