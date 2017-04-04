"use strict";

const db = require('../../utils/databrowser');
const appium = require('../../utils/appium');

function test() {

  const self = this;

  it('should get response from the cloud', function() {
    return self.driver
      .elementByCss('.cloud-action').click()
      .sleep(2000)
      .elementByCss('.cloud-action-button').click()
      .sleep(3000)
      .elementByCss('.response_content').text().should.become('Response: Hello from FeedHenry')
      .elementByCss('.btn.back').click()
      .sleep(2000);
  });

  it('should save value to Data Browser', function() {
    const value = new Date().getTime().toString();

    return self.driver
      .elementByCss('.data-browser').click()
      .sleep(2000)
      .elementByCss('#nameField').sendKeys(value)
      .elementByCss('.save-data').click()
      .sleep(3000)
      .elementByCss('.extra_response').text().should.become('Your data is now saved. Please go to studio and see your data using the Data Browser.')
      .elementByCss('.btn.back').click()
      .sleep(10000)
      .then(() =>
        db.isItemInDb(self, 'Users', value)
      ).should.become(true);
  });

  it('should get location', function() {
    return self.driver
      .elementByCss('.weather-sample').click()
      .sleep(2000)
      .elementByCss('.get-geo-btn').click()
      .sleep(2000)
      .then(() => {
        if (self.type !== 'client_hybrid') {
          return self.driver
            .context('NATIVE_APP')
            .hasElementByName('Get My Weather Info')
            .then(exists => {
              if (!exists) {
                return self.driver.acceptAlert().sleep(2000);
              }
            })
            .then(() => appium.webviewContext(self.driver))
            .elementByCss('.get-weather-btn').click()
            .sleep(2000);
        }
      })
      .elementByCss('.btn.back').click()
      .sleep(2000);
  });

  it('should open the rest of pages', function() {
    return self.driver
      .elementByCss('.nodejs-page').click()
      .sleep(2000)
      .elementByCss('.btn.back').click()
      .sleep(2000)
      .elementByCss('.cloud-integration').click()
      .sleep(2000)
      .elementByCss('.btn.back').click()
      .sleep(2000)
      .elementByCss('.stats-analytics').click()
      .sleep(2000)
      .elementByCss('.btn.back').click()
      .sleep(2000);
  });

}

module.exports = test;
