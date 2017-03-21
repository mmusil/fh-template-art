"use strict";

function test() {

  const self = this;

  step('should wait for the app to initialize', function() {
    return self.driver
      .sleep(5000);
  });

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
    return self.driver
      .elementByCss('.data-browser').click()
      .sleep(2000)
      .elementByCss('#nameField').sendKeys('test')
      .elementByCss('.save-data').click()
      .sleep(3000)
      .elementByCss('.extra_response').text().should.become('Your data is now saved. Please go to studio and see your data using the Data Browser.')
      .elementByCss('.btn.back').click()
      .sleep(2000);
  });

  it('should get location', function() {
    return self.driver
      .elementByCss('.weather-sample').click()
      .sleep(2000)
      .elementByCss('.get-geo-btn').click()
      .sleep(1000)
      .context('NATIVE_APP')
      .hasElementByName('Get My Weather Info')
      .then(exists => {
        if (!exists) {
          return self.driver.acceptAlert().sleep(2000);
        }
      })
      .then(self.webviewContext)
      .elementByCss('.get-weather-btn').click()
      .sleep(2000)
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
