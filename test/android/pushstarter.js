"use strict";

function test() {

  const self = this;
  const testString = Date.now()+'appium';

  step('should send notification', function() {
    return self.sendPushNotification(testString);
  });

  it('should receive notification', function() {
    return self.driver
      .sleep(10000)
      .elementByAndroidUIAutomator(`new UiSelector().text("${testString}")`)
      .text().should.become(testString);
  });
}

module.exports = test;
