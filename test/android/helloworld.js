"use strict";

function test() {

  const self = this;

  it('should get response from cloud', function() {
    return self.driver
      .elementByAndroidUIAutomator('new UiSelector().resourceId("com.feedhenry.helloworld:id/button")')
        .click().sleep(3000)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("com.feedhenry.helloworld:id/cloud_response")')
        .text().should.become('Hello World');
  });

  it('should get custom response from cloud', function() {
    return self.driver
      .elementByAndroidUIAutomator('new UiSelector().resourceId("com.feedhenry.helloworld:id/name")')
        .sendKeys("1234appium test")
      .elementByAndroidUIAutomator('new UiSelector().resourceId("com.feedhenry.helloworld:id/button")')
        .click().sleep(3000)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("com.feedhenry.helloworld:id/cloud_response")')
        .text().should.become('Hello 1234appium test');
  });

}

module.exports = test;
