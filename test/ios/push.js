"use strict";

function test() {

  const self = this;

  it('should receive notification', function() {
    return self.driver
      .acceptAlert()
      .then(() => self.sendPushNotification('test'))
      .sleep(10000)
      .elementByName('test').text().should.become('test');
  });

}

module.exports = test;
