"use strict";

const db = require('../../utils/databrowser');

function test() {

  const self = this;
  const testString = Date.now()+'appium';

  it('should call cloud', function() {
    return self.driver
      .elementByAndroidUIAutomator('new UiSelector().resourceId("org.feedhenry.welcome:id/call_cloud")')
        .click().sleep(1000)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("org.feedhenry.welcome:id/call_cloud")')
        .click().sleep(5000)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("org.feedhenry.welcome:id/response")')
        .text().should.become('Response: Hello from FeedHenry')
      .elementByAndroidUIAutomator('new UiSelector().className("android.widget.ImageButton").instance(0)')
        .click().sleep(1000);
  });

  it('should save value to Data Browser', function() {
    return self.driver
      .elementByAndroidUIAutomator('new UiSelector().text("Data browser")')
        .click().sleep(1000)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("org.feedhenry.welcome:id/data")')
        .sendKeys(testString).sleep(1000)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("org.feedhenry.welcome:id/save")')
        .click().sleep(5000)
      .then(() =>
        db.isItemInDb(self,'Users', 'data', testString)
      ).should.become(true);
  });
}

module.exports = test;
