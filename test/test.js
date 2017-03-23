"use strict";

const clientApps = require('../client-apps');
const config = require('../config/common.json');
const testConfig = require('../config/test.json');
const fhc = require('../utils/fhc');
const Project = require('../model/project');

describe('Tests for client apps', function() {

  this.timeout(15 * 60 * 1000);

  before(function() {
    return fhc.init(config.host, config.username, config.password);
  });

  testConfig.platforms.forEach(platform => {
    testConfig.types.forEach(type => {
      let apps = clientApps[platform][type];

      if (testConfig.template) {
        apps = apps.filter(app =>
          app.projectTemplateId === testConfig.template
        );
      }

      if (platform === 'ios' && type === 'native' && testConfig.iostype) {
        apps = apps.filter(app =>
          app.name.includes(testConfig.iostype)
        );
      }

      apps.forEach(clientApp => {
        describe(`Test for ${platform} ${type} "${clientApp.name}"`, function() {

          before(function() {
            // clientApp.buildFile = require('path').resolve(__dirname, '../builds/1490266771585.app');

            const project = new Project(clientApp);

            // return Promise.resolve()
            return project.prepare()
              .then(clientApp.prepare)
              .then(clientApp.build)
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

});
