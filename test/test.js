"use strict";

const clientApps = require('../client-apps');
const config = require('../config/config');
const fhc = require('../utils/fhc');
const cleanup = require('../utils/cleanup');

describe('Tests for client apps', function() {

  this.timeout(15 * 60 * 1000);

  before(function() {
    return fhc.init(config.host, config.username, config.password)
      .then(cleanup);
  });

  clientApps.forEach(function(clientApp) {
    describe(`Test for ${clientApp.clientAppName}`, function() {

      before(function() {
        clientApp.buildType = config.buildType[clientApp.buildPlatform];
        // clientApp.buildFile = require('path').resolve(__dirname, '../builds/1490016840897.app');

        // return Promise.resolve()
        return clientApp.prepareEnvironment()
          .then(clientApp.build)
          .then(clientApp.findDevice)
          .then(clientApp.initAppium);
      });

      after(function() {
        return clientApp.finishAppium();
      });

      clientApp.test();

    });
  });

});
