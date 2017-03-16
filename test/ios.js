"use strict";

const templates = require('../templates/ios');

describe('Tests for iOS client apps', function() {

  this.timeout(15 * 60 * 1000);

  for (const template of templates) {
    describe(`Test for ${template.clientAppName}`, function() {

      before(function() {
        return template.prepare();
      });

      after(function() {
        return template.cleanup();
      });

      it('should pass UI tests', function() {
        return template.test();
      });

    });
  }

});
