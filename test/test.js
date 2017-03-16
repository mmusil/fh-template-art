"use strict";

const clientApps = require('../client-apps');
const config = require('../config/config');
const fhc = require('../utils/fhc');

describe('Tests for client apps', function() {

  this.timeout(15 * 60 * 1000);

  before(function() {
    return fhc.init(config.host, config.username, config.password);
  });

  clientApps.forEach(function(clientApp) {
    describe(`Test for ${clientApp.clientAppName}`, function() {

      before(function() {
        clientApp.buildType = clientApp.buildPlatform === 'android' ? config.buildTypeAndroid : config.buildTypeIOS;

        return clientApp.prepareEnvironment()
          .then(clientApp.prepareCredBundle)
          .then(clientApp.build)
          .then(clientApp.initAppium);
      });

      clientApp.test();

    });
  });

});
