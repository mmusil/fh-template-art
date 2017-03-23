"use strict";

const program = require('commander');
const pkg = require('./package.json');
const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, 'config/test.json');

const template = {
  welcome: 'welcome_project',
  helloworld: 'hello_world_project',
  push: 'pushstarter_project',
  saml: 'saml_project'
};

const iostype = {
  objc: 'Objective-C',
  swift: 'Swift'
};

program
  .version(pkg.version)
  .option('-l, --platform <platform>', 'platform (android|ios|all)', /^(android|ios|all)$/i, 'all')
  .option('-t, --type <type>', 'type (native|cordova|all)', /^(native|cordova|all)$/i, 'all')
  .option('-m, --template <template>', 'template (welcome|helloworld|push|saml|all)', /^(welcome|helloworld|push|saml|all)$/i, 'all')
  .option('-i, --iostype <iostype>', 'iOS type (objc|swift|all)', /^(objc|swift|all)$/i, 'all')
  .parse(process.argv);

const settings = {};

if (program.platform === 'all') {
  settings.platforms = ['android', 'ios'];
} else {
  settings.platforms = [program.platform];
}

if (program.type === 'all') {
  settings.types = ['native', 'cordova'];
} else {
  settings.types = program.type;
}

if (program.template !== 'all') {
  settings.template = template[program.template];
}

if (program.iostype !== 'all') {
  settings.iostype = iostype[program.iostype];
}

fs.writeFileSync(file, JSON.stringify(settings, null, 2));
