"use strict";

function test() {

  const self = this;

  step('should enable push', function() {
    return self.driver
      .acceptAlert();
  });

  step('should send notification', function() {
    return self.sendPushNotification('test');
  });

  step('should receive notification', function() {
    return self.driver
      .sleep(10000)
      .elementByName('test').text().should.become('test');
  });

}

module.exports = test;
