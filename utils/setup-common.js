"use strict";

const program = require('commander');
const pkg = require('../package.json');
const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../config/common.json');

program
  .version(pkg.version)
  .option('-t, --host <host>', 'RHMAP host')
  .option('-u, --username <username>', 'RHMAP Username')
  .option('-p, --password <password>', 'RHMAP password')
  .option('-e, --environment <environment>', 'RHMAP environment')
  .option('-f, --prefix <prefix>', 'prefix', 'app-art-')
  .option('-r, --retries <retries>', 'number of retries', parseInt, 3)
  .option('-c, --cleanup', 'perform cleanup')
  .parse(process.argv);

if (
  !program.host ||
  !program.username ||
  !program.password ||
  !program.environment
) {
  return program.outputHelp();
}

const settings = {
  host: program.host,
  username: program.username,
  password: program.password,
  environment: program.environment,
  prefix: program.prefix,
  retries: program.retries,
  cleanup: program.cleanup
};

fs.writeFileSync(file, JSON.stringify(settings, null, 2));
