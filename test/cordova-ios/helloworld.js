"use strict";

function test() {

  const self = this;

  step('should wait for the app to initialize', function() {
    return self.driver
      .sleep(5000);
  });

  it('should get response from the cloud', function() {
    return self.driver
      .elementByXPath("//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[4]/XCUIElementTypeTextField[1]")
        .sendKeys("test")
      .elementByName("Say Hello From The Cloud").click()
      .sleep(3000)
      .elementByName("Hello test").text().should.become('Hello test');
  });

}

module.exports = test;
