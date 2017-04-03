"use strict";

const appium = require('../../utils/appium');

function test() {

  const self = this;

  it('should sign in', function() {
    return self.driver
      .elementByCss('.sign-in-button').click()
      .sleep(10000)
      .then(() => self.driver.contexts())
      .then(contexts => self.driver.context(contexts[2]))
      .elementByCss('#username').sendKeys("student")
      .elementByCss('#password').sendKeys("studentpass")
      .elementByCss('#regularsubmit').isDisplayed()
      .then(visible => {
        if (visible) {
          return self.driver.elementByCss('#regularsubmit').click();
        } else {
          return self.driver.elementByCss('#mobilesubmit').click();
        }
      })
      .context('NATIVE_APP')
      .sleep(10000)
      .alertText().should.eventually.include('Great, you\'re signed in!')
      .dismissAlert()
      .then(() => appium.webviewContext(self.driver));
  });

}

module.exports = test;
