"use strict";

function test() {

  const self = this;

  it('should get response from the cloud', function() {
    return self.driver
      .elementByCss('#hello_to').sendKeys('test')
      .elementByCss('#say_hello').click()
      .sleep(3000)
      .elementByCss('#cloudResponse').text().should.become('Hello test');
  });

}

module.exports = test;
