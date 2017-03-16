"use strict";

const templates = require('../templates/android');
const config = require('../config/config');
const fhc = require('../utils/fhc');

describe('Tests for Android client apps', function() {

  this.timeout(15 * 60 * 1000);

  templates.forEach(function(template) {
    describe(`Test for ${template.clientAppName}`, function() {

      before(function() {
        return fhc.init(config.host, config.username, config.password);
      });

      after(function() {
        return template.cleanup();
      });

      step('should prepare project with running cloud app', function() {
        return template.prepareProject();
      });

      step('should prepare connection', function() {
        return template.prepareConnection();
      });

      step('should prepare credentials bundle', function() {
        return template.prepareCredBundle();
      });

      step('should build the app', function() {
        return template.buildClientApp();
      });

      step('should init appium', function() {
        return template.initAppium();
      });

      template.UITests();

    });
  });

});
