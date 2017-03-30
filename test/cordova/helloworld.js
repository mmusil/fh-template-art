"use strict";

function test(driver) {

  it('should get response from the cloud', function() {
    return driver
      .elementByCss('#hello_to').sendKeys('test')
      .elementByCss('#say_hello').click()
      .sleep(3000)
      .elementByCss('#cloudResponse').text().should.become('Hello test');
  });

}

module.exports = test;
