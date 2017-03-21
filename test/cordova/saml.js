"use strict";

function test() {

  const self = this;

  step('should wait for the app to initialize', function() {
    return self.driver
      .sleep(5000);
  });

  it('should sign in', function() {
    // return self.driver;
  });

}

module.exports = test;
