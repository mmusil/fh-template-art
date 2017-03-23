"use strict";

const fhc = require('../utils/fhc');
const config = require('../config/config');
const wd = require('wd');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
const appiumConfig = require('../config/appium');
const studio = require('../utils/studio');
const git = require('../utils/git');
const rimraf = require('../utils/rimraf');
const path = require('path');

class ClientApp {

  constructor(projectTemplateId, name, platform, test, cordova) {
    this.projectTemplateId = projectTemplateId;
    this.name = name;
    this.platform = platform;
    this.test = test.bind(this);
    this.push = projectTemplateId === 'pushstarter_project';
    this.cordova = cordova;

    this.webviewContext = this.webviewContext.bind(this);
    this.initAppium = this.initAppium.bind(this);
    this.finishAppium = this.finishAppium.bind(this);
    this.prepareCredBundle = this.prepareCredBundle.bind(this);
    this.prepare = this.prepare.bind(this);
    this.findSuitableCredBundle = this.findSuitableCredBundle.bind(this);
    this.sendPushNotification = this.sendPushNotification.bind(this);
    this.prepareConnection = this.prepareConnection.bind(this);
  }

  webviewContext() {
    return this.driver.contexts()
      .then(contexts =>
        this.driver.context(contexts[1])
      );
  }

  initAppium() {
    console.log('Initializing appium');

    this.driver = wd.promiseChainRemote(appiumConfig.server);

    appiumConfig[this.platform].app = this.buildFile;

    return this.driver.init(appiumConfig[this.platform])
      .then(() => {
        if (this.cordova) {
          return this.webviewContext();
        }
      });
  }

  finishAppium() {
    if (this.driver) {
      return this.driver.quit();
    }
  }

  prepareCredBundle() {
    console.log('Preparing creadentials bundle');

    return this.findSuitableCredBundle()
      .then(credBundle => {
        if (!credBundle) {
          return this.createCredBundle();
        }
        this.credBundle = credBundle;
      });
  }

  findSuitableCredBundle() {
    return fhc.credentialsList()
      .then(credentials =>
        credentials.find(cred =>
          cred.bundleName.startsWith(config.prefix + (this.push ? 'push-' : 'normal-')) &&
          cred.platform === this.platform &&
          cred.bundleType === this.buildType
        )
      );
  }

  prepare() {
    console.log('Preparing client app');

    this.credConfig = this.push ?
      config[this.platform].push[this.buildType] :
      config[this.platform][this.buildType];

    this.details = this.project.apps.find(app =>
      app.title === this.name
    );

    return this.prepareConnection()
      .then(this.prepareCredBundle)
      .then(() => {
        if (this.projectTemplateId === 'pushstarter_project') {
          return this.preparePush();
        }
      })
      .then(() => {
        if (this.projectTemplateId === 'saml_project') {
          return this.prepareSAML();
        }
      });
  }

  editFile(fileName, editFunc) {
    const tempFolder = path.resolve(__dirname, '../temp');
    const file = path.resolve(tempFolder, fileName);

    return rimraf(tempFolder)
      .then(() => git.clone(this.details.internallyHostedRepoUrl, tempFolder, 'master'))
      .then(() => editFunc(file))
      .then(() => git.add(fileName, tempFolder))
      .then(() => git.commit('Updated bundleId', tempFolder))
      .then(() => git.push('origin', 'master', tempFolder))
      .then(() => studio.pullApp(this));
  }

  sendPushNotification() {
    return studio.sendPushNotification(this);
  }

  prepareConnection() {
    console.log('Preparing connection');

    return fhc.connectionsList(this.project.guid)
      .then(connections => connections.find(connection =>
        connection.clientApp === this.details.guid &&
        connection.status === 'ACTIVE'
      ))
      .then(connection =>
        fhc.connectionUpdate(
          this.project.guid,
          connection.guid,
          this.cloudApp.guid,
          config.environment
        )
      )
      .then(connection => {
        this.connection = connection;
      });
  }

}

module.exports = ClientApp;
