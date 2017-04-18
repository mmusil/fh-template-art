"use strict";

const fhc = require('../utils/fhc');
const config = require('../config/common.json');
const git = require('../utils/git');
const rimraf = require('../utils/rimraf');
const path = require('path');
const credConfig = require('../config/credentials.json');
const databrowser = require('../utils/databrowser');
const push = require('../utils/push');
const fs = require('fs');
const request = require('request');

class ClientApp {

  constructor(projectTemplateId, name, platform, test, type, repo, branch) {
    this.projectTemplateId = projectTemplateId;
    this.name = name;
    this.platform = platform;
    this.test = test.bind(this);
    this.push = projectTemplateId === 'pushstarter_project';
    this.type = type;
    this.cordova = type === 'client_advanced_hybrid' || type === 'client_hybrid';
    this.buildType = 'debug';
    this.repo = repo;
    this.branch = branch;

    this.prepareCredBundle = this.prepareCredBundle.bind(this);
    this.prepare = this.prepare.bind(this);
    this.prepareSync = this.prepareSync.bind(this);
    this.editFile = this.editFile.bind(this);
    this.findSuitableCredBundle = this.findSuitableCredBundle.bind(this);
    this.sendPushNotification = this.sendPushNotification.bind(this);
    this.prepareConnection = this.prepareConnection.bind(this);
    this.getUserDetails = this.getUserDetails.bind(this);
    this.getCloudHostURL = this.getCloudHostURL.bind(this);
    this.prepareBuild = this.prepareBuild.bind(this);
    this.downloadBuild = this.downloadBuild.bind(this);
  }

  prepareCredBundle() {
    console.log('Preparing creadentials bundle');

    return this.findSuitableCredBundle()
      .then(credBundle => {
        if (!credBundle) {
          return this.createCredBundle();
        }
        this.credBundleId = credBundle.id;
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
      .then(() => fhc.gitPull(this.project.guid, this.details.guid));
  }

  sendPushNotification(message) {
    return push.sendNotification(this, message);
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

    return fhc.getCloudUrl(this.cloudApp.guid, config.environment)
    .then(res=>{
      this.cloudHost = res;
    },
    error => {
      throw new Error('Can not get cloud url: ' + error);
    });
  }

  prepareBuild() {
    console.log('Preparing build');

    return fhc.artifacts(this.project.guid, this.details.guid)
      .then(artifacts => artifacts.filter(artifact =>
        artifact.destination === this.platform &&
        artifact.env === config.environment &&
        artifact.status === 'finished' &&
        artifact.type === this.buildType
      ))
      .then(builds => {
        if (builds.length > 0) {
          return this.downloadBuild(builds[0]);
        } else {
          return this.build();
        }
      })
      .then(this.prepareBuildFile);
  }

  downloadBuild(build) {
    console.log('Downloading build');

    return new Promise((resolve, reject) => {
      const buildId = new Date().getTime();
      const ext = this.platform === 'android' ? '.apk' : '.zip';
      this.buildDownloadedFile = path.resolve(__dirname, `../${buildId}${ext}`);
      const download = request(build.downloadurl).pipe(fs.createWriteStream(this.buildDownloadedFile));
      download.on('error', reject);
      download.on('finish', resolve);
    });
  }

}

module.exports = ClientApp;
