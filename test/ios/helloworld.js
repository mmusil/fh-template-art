"use strict";

function test(driver) {

  it('should get response from cloud', function() {
    return driver
      .elementByName("Call").click()
      .sleep(5000)
      .elementByXPath("//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextView[1]")
        .text().should.become('Hello World');
  });

  it('should get custom response from cloud', function() {
    return driver
      .elementByXPath("//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextField[1]")
        .clear()
      .elementByXPath("//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextField[1]")
        .sendKeys("test")
      .elementByName("Call").click()
      .elementByXPath("//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextView[1]")
        .text().should.become('Hello test');
  });

}

module.exports = test;
