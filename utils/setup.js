"use strict";

const program = require('commander');
const pkg = require('../package.json');

program
  .version(pkg.version)
  .command('common', 'common setting')
  .command('test', 'test settings')
  .parse(process.argv);
