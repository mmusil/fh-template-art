"use strict";

const db = require('../../utils/databrowser');

function test() {

  const self = this;
  const testString = Date.now()+'appium';

  step('should wait for the app to initialize', function() {
    return self.driver
      .sleep(5000);
  });

  it('should call cloud', function() {
    return self.driver
      .elementByAndroidUIAutomator('new UiSelector().resourceId("org.feedhenry.welcome:id/call_cloud")')
        .click().sleep(1000)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("org.feedhenry.welcome:id/call_cloud")')
        .click().sleep(5000)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("org.feedhenry.welcome:id/response")')
        .text().should.become('Response: Hello from FeedHenry');
  });

  it('should save value to Data Browser', function() {
    return self.driver
      .elementByAndroidUIAutomator('new UiSelector().className("android.widget.ImageButton").instance(0)')
        .click().sleep(1000)
      .elementByAndroidUIAutomator('new UiSelector().text("Data browser")')
        .click().sleep(1000)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("org.feedhenry.welcome:id/data")')
        .sendKeys(testString).sleep(1000)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("org.feedhenry.welcome:id/save")')
        .click().sleep(5000)
      .then(() =>
        db.getItemFromDb(self,'Users',testString)
      ).should.become(testString);

  });
}

module.exports = test;
