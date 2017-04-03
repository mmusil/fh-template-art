"use strict";

const appium = require('../../utils/appium');

function test() {

  const self = this;

  it('should sign in', function() {
    return self.driver
      .elementByName("Sign In").click()
      .sleep(10000)
      .then(() => appium.webviewContext(self.driver))
      .elementByCss('#username').sendKeys("student")
      .elementByCss('#password').sendKeys("studentpass")
      .elementByCss('input[type="submit"]').click()
      .context('NATIVE_APP')
      .sleep(5000)
      .elementByName("Great! You're signed in.").text().should.become("Great! You're signed in.");
  });

}

module.exports = test;
