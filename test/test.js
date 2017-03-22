"use strict";

const clientApps = require('../client-apps');
const config = require('../config/config');
const fhc = require('../utils/fhc');
const cleanup = require('../utils/cleanup');
const Project = require('../model/project');

describe('Tests for client apps', function() {

  this.timeout(15 * 60 * 1000);

  before(function() {
    return fhc.init(config.host, config.username, config.password)
      .then(cleanup);
  });

  clientApps.forEach(clientApp => {
    config.buildTypes[clientApp.platform].forEach(buildType => {
      describe(`Test for ${clientApp.clientAppName} ${buildType}`, function() {

        before(function() {
          clientApp.buildType = buildType;
          // clientApp.buildFile = require('path').resolve(__dirname, '../builds/1490088929067.app');

          const project = new Project(clientApp);

          // return Promise.resolve()
          return project.prepare()
            .then(clientApp.prepareEnvironment)
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

});
