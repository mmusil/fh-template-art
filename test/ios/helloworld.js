"use strict";

function test() {

  const self = this;

  step('should wait for the app to initialize', function() {
    return self.driver
      .sleep(5000);
  });

  it('should get response from cloud', function() {
    return self.driver
      .elementByName("Call").click()
      .sleep(5000)
      .elementByXPath("//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextView[1]")
        .text().should.become('Hello World')
      .catch(self.takeScreenshot);
  });

  it('should get custom response from cloud', function() {
    return self.driver
      .elementByXPath("//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextField[1]")
        .clear()
      .elementByXPath("//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextField[1]")
        .sendKeys("test")
      .elementByName("Call").click()
      .elementByXPath("//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextView[1]")
        .text().should.become('Hello test')
      .catch(self.takeScreenshot);
  });

}

module.exports = test;
