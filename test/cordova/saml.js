"use strict";

function test() {

  const self = this;

  step('should wait for the app to initialize', function() {
    return self.driver
      .sleep(5000);
  });

  it('should sign in', function() {
    return self.driver
      .elementByCss('.sign-in-button').click()
      .sleep(10000)
      .context('NATIVE_APP')
      .elementByXPath("//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[3]/XCUIElementTypeTextField[1]")
        .sendKeys("student")
      .elementByXPath("//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[5]/XCUIElementTypeSecureTextField[1]")
        .sendKeys("studentpass")
      .elementByName("Login").click()
      .sleep(10000)
      .alertText().should.eventually.include('Great, you\'re signed in!')
      .dismissAlert()
      .then(self.webviewContext)
      .catch(self.takeScreenshot);
  });

}

module.exports = test;
