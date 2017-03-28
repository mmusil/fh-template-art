"use strict";

function test() {

  const self = this;

  step('should wait for the app to initialize', function() {
    return self.driver
      .sleep(5000);
  });

  it('should get response from the cloud', function() {
    return self.driver
      .elementByCss('#hello_to').sendKeys('test')
      .elementByCss('#say_hello').click()
      .sleep(3000)
      .elementByCss('#cloudResponse').text().should.become('Hello test')
      .catch(self.takeScreenshot);
  });

}

module.exports = test;
