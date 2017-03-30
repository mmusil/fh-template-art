"use strict";

const db = require('../../utils/databrowser');

function test() {

  const self = this;

  it('should cancel adding a value', function() {
    const value = 'value-cancel-' + new Date().getTime().toString();

    return self.driver
      .elementByXPath('//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeNavigationBar[1]/XCUIElementTypeButton[1]')
        .click().sleep(2000)
      .elementByXPath('//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextField[1]')
        .sendKeys(value)
      .elementByXPath('//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeNavigationBar[1]/XCUIElementTypeButton[1]')
        .click().sleep(2000)
      .then(() =>
        db.isItemInDb(self, 'myShoppingList', value)
      ).should.become(false);
  });

  it('should add a value', function() {
    const value = 'value1-' + new Date().getTime().toString();

    return self.driver
      .elementByXPath('//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeNavigationBar[1]/XCUIElementTypeButton[1]')
        .click().sleep(2000)
      .elementByXPath('//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextField[1]')
        .sendKeys(value)
      .elementByName('Save')
        .click().sleep(2000)
      .elementByXPath('//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTable[1]/XCUIElementTypeCell[1]/XCUIElementTypeStaticText[1]')
        .text().should.become(value)
      .then(() =>
        db.isItemInDb(self, 'myShoppingList', value)
      ).should.become(true);
  });

  it('should edit a value', function() {
    const value = 'value2-' + new Date().getTime().toString();

    return self.driver
      .elementByXPath('//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTable[1]/XCUIElementTypeCell[1]/XCUIElementTypeStaticText[1]')
        .click().sleep(2000)
      .elementByXPath('//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextField[1]')
        .clear()
      .elementByXPath('//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextField[1]')
        .sendKeys(value)
      .elementByName('Save')
        .click().sleep(2000)
      .elementByXPath('//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTable[1]/XCUIElementTypeCell[1]/XCUIElementTypeStaticText[1]')
        .text().should.become(value)
      .then(() =>
        db.isItemInDb(self, 'myShoppingList', value)
      ).should.become(true);
  });

  //TODO: should delete a value

}

module.exports = test;
