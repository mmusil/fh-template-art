"use strict";

function test() {

  const self = this;

  step('should wait for the app to initialize', function() {
    return self.driver
      .sleep(5000);
  });

  step('should enable push', function() {
    return self.driver
      .acceptAlert();
  });

  step('should send notification', function() {
    return self.sendPushNotification();
  });

  it('should receive notification', function() {
    return self.driver
      .sleep(10000)
      .elementByName('test').text().should.become('test');
  });

}

module.exports = test;
