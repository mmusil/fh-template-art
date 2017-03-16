"use strict";

function test(driver) {

  step('should wait for the app to initialize', function() {
    return driver
      .sleep(5000);
  });

}

module.exports = test;
