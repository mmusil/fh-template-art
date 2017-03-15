"use strict";

const Template = require('./template');

class IOSWelcomeSwiftTemplate extends Template {

  constructor(buildType) {
    super('welcome_project', 'Welcome Project iOS (Swift)', 'ios', buildType);

    this.test = this.test.bind(this);
  }

  test() {
    it('should pass UI tests', function() {

    });
  }

}

module.exports = IOSWelcomeSwiftTemplate;
