"use strict";

function test(driver) {

  const self = this;

  step('should enable push', function() {
    return driver
      .acceptAlert();
  });

  step('should send notification', function() {
    return self.sendPushNotification();
  });

  it('should receive notification', function() {
    return driver
      .sleep(10000)
      .elementByName('test').text().should.become('test');
  });

}

module.exports = test;
