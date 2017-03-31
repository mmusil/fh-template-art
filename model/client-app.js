"use strict";

const fhc = require('../utils/fhc');
const config = require('../config/common.json');
const studio = require('../utils/studio');
const git = require('../utils/git');
const rimraf = require('../utils/rimraf');
const path = require('path');
const credConfig = require('../config/credentials.json');
const databrowser = require('../utils/databrowser');

class ClientApp {

  constructor(projectTemplateId, name, platform, test, cordova) {
    this.projectTemplateId = projectTemplateId;
    this.name = name;
    this.platform = platform;
    this.test = test.bind(this);
    this.push = projectTemplateId === 'pushstarter_project';
    this.cordova = cordova;
    this.buildType = 'debug';

    this.prepareCredBundle = this.prepareCredBundle.bind(this);
    this.prepare = this.prepare.bind(this);
    this.prepareSync = this.prepareSync.bind(this);
    this.editFile = this.editFile.bind(this);
    this.findSuitableCredBundle = this.findSuitableCredBundle.bind(this);
    this.sendPushNotification = this.sendPushNotification.bind(this);
    this.prepareConnection = this.prepareConnection.bind(this);
    this.getUserDetails = this.getUserDetails.bind(this);
    this.getCloudHostURL = this.getCloudHostURL.bind(this);
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
      credConfig[this.platform].push :
      credConfig[this.platform];

    this.details = this.project.apps.find(app =>
      app.title === this.name
    );

    return this.prepareConnection()
      .then(this.prepareCredBundle)
      .then(() => fhc.environmentRead(config.environment))
      .then(env => {
        this.environment = env.label;
      })
      .then(this.getUserDetails)
      .then(this.getCloudHostURL)
      .then(() => {
        if (this.projectTemplateId === 'sync_project') {
          return this.prepareSync();
        }
      })
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

  prepareSync() {
    return databrowser.deleteAllRows(this, 'myShoppingList');
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

  getUserDetails() {
    console.log('Preparing userkey');

    return fhc.getUserKey(config.username)
    .then(res=>{
      this.username = config.username;
      this.userKey = res;
    },
    err=>{
      if (err) {
        throw new Error('Can not get or create user key');
      }
    });
  }

  getCloudHostURL() {
    console.log('Reading deployed cloud app URL');

    return fhc.getCloudUrl(this.cloudApp.guid, this.environment)
    .then(res=>{
      this.cloudHost = res;
    },
    ()=>{
      throw new Error('Can not get cloud url');
    });
  }

}

module.exports = ClientApp;
