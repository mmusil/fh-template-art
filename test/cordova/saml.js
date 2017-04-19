"use strict";

const appium = require('../../utils/appium');

function test() {

  const self = this;

  it('should sign in', function() {
    return self.driver
      .elementByCss('.sign-in-button').click()
      .sleep(10000)
      .then(() => {
        if (self.platform === 'android') {
          return self.driver
            .context('NATIVE_APP')
            .elementByXPath("//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.webkit.WebView[1]/android.webkit.WebView[1]/android.view.View[1]/android.view.View[5]/android.view.View[2]/android.widget.EditText[1]")
              .sendKeys("student")
            .elementByXPath("//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.webkit.WebView[1]/android.webkit.WebView[1]/android.view.View[1]/android.view.View[5]/android.view.View[5]/android.widget.EditText[1]")
              .sendKeys("studentpass")
            .elementByXPath("//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.webkit.WebView[1]/android.webkit.WebView[1]/android.view.View[1]/android.view.View[5]/android.view.View[3]/android.widget.Button[1]")
              .click()
            .sleep(10000)
            .elementByXPath("//android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.LinearLayout[3]/android.widget.Button[1]")
              .click();
        } else {
          return self.driver.contexts()
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
        }
      });
  });

}

module.exports = test;
