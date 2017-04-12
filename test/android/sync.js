"use strict";

const db = require('../../utils/databrowser');

function test() {

  const self = this;
  const testString = Date.now()+'appium';

  step('should add a value', function() {

    return self.driver
      .elementByAndroidUIAutomator('new UiSelector().resourceId("com.feedhenry.helloworld:id/fab")')
        .click().sleep(1000)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("com.feedhenry.helloworld:id/name")')
        .sendKeys(testString)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("com.feedhenry.helloworld:id/md_buttonDefaultPositive")')
        .click().sleep(1000)
      .elementByAndroidUIAutomator(`new UiSelector().text("${testString}")`)
        .text().should.become(testString)
      .then(() => 
        db.isItemInDb(self, 'myShoppingList', 'name', testString)
      ).should.become(true);
  });

  it('should edit a value', function() {
    const testString_2 = Date.now()+'appium_2';

    return self.driver
      .elementByAndroidUIAutomator(`new UiSelector().text("${testString}")`)
        .click()
      .elementByAndroidUIAutomator('new UiSelector().resourceId("com.feedhenry.helloworld:id/name")')
        .sendKeys(testString_2)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("com.feedhenry.helloworld:id/md_buttonDefaultPositive")')
        .click().sleep(1000)
      .elementByAndroidUIAutomator(`new UiSelector().text("${testString_2}")`)
        .text().should.become(testString_2)
      .then(() => 
        db.isItemInDb(self, 'myShoppingList', 'name', testString_2)
      ).should.become(true);
  });

  it('should cancel adding a value', function() {
    const testString_3 = Date.now()+'appium_3';

    return self.driver
      .elementByAndroidUIAutomator('new UiSelector().resourceId("com.feedhenry.helloworld:id/fab")')
        .click().sleep(1000)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("com.feedhenry.helloworld:id/name")')
        .sendKeys(testString_3)
      .elementByAndroidUIAutomator('new UiSelector().resourceId("com.feedhenry.helloworld:id/md_buttonDefaultNegative")')
        .click().sleep(1000)
      .then(() => 
        db.isItemInDb(self, 'myShoppingList', 'name', testString_3)
      ).should.become(false);
  });

  //TODO: should delete a value

}

module.exports = test;
