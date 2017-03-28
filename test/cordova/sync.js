"use strict";

const db = require('../../utils/databrowser');

function test() {

  const self = this;

  step('should wait for the app to initialize', function() {
    return self.driver
      .sleep(5000);
  });

  it('should cancel adding a value', function() {
    const value = 'value-cancel-' + new Date().getTime().toString();

    return self.driver
      .elementByCss('.ion-plus')
        .click().sleep(2000)
      .elementByCss('.item-input input')
        .sendKeys(value)
      .elementByCss('.ion-ios-list-outline')
        .click().sleep(2000)
      .then(() =>
        db.getItemFromDb(self, 'myShoppingList', value)
      ).should.become(undefined)
      .catch(self.takeScreenshot);
  });

  it('should add a value', function() {
    const value = 'value1-' + new Date().getTime().toString();

    return self.driver
      .elementByCss('.ion-plus')
        .click().sleep(2000)
      .elementByCss('.item-input input')
        .sendKeys(value)
      .elementByCss('a.button')
        .click().sleep(2000)
      .elementByCss('ion-list:first-child .item-content')
        .text().should.eventually.include(value)
      .then(() =>
        db.getItemFromDb(self, 'myShoppingList', value)
      ).should.become(value)
      .catch(self.takeScreenshot);
  });

  it('should edit a value', function() {
    const value = 'value2-' + new Date().getTime().toString();

    return self.driver
      .elementByCss('ion-list:first-child .item-content')
        .click().sleep(2000)
      .elementByCss('ion-view[title="Edit"] input')
        .clear()
      .elementByCss('ion-view[title="Edit"] input')
        .sendKeys(value)
      .elementByCss('ion-view[title="Edit"] a.button')
        .click().sleep(2000)
      .elementByCss('ion-list:first-child .item-content')
        .text().should.eventually.include(value)
      .then(() =>
        db.getItemFromDb(self, 'myShoppingList', value)
      ).should.become(value)
      .catch(self.takeScreenshot);
  });

  //TODO: should delete a value

}

module.exports = test;
