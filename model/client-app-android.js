"use strict";

const fhc = require('../utils/fhc');
const fs = require('fs');
const fsp = require('fs-promise');
const ClientApp = require('./client-app');
const path = require('path');
const config = require('../config/common.json');
const push = require('../utils/push');
const credConfig = require('../config/credentials.json');
const async = require('../utils/async');

class AndroidClientApp extends ClientApp {

  constructor(projectTemplateId, clientAppName, test, type, repo, branch) {
    super(projectTemplateId, clientAppName, 'android', test, type, repo, branch);

    this.cleanup = this.cleanup.bind(this);
    this.prepareSAML = this.prepareSAML.bind(this);
    this.preparePush = this.preparePush.bind(this);
    this.createCredBundle = this.createCredBundle.bind(this);
    this.build = this.build.bind(this);
  }

  cleanup() {

  }

  prepareSAML() {

  }

  preparePush() {
    return push.startPush(this,credConfig.android.push,'appium-android','android')
    .then(() =>
      this.editFile('app/google-services.json', function(file) {
        var fixtureFile = path.resolve(__dirname,'../fixtures/google-services.json');
        return fsp.copy(fixtureFile,file);
      })
    );
  }

  createCredBundle() {

  }

  build() {
    console.log('Building client app');

    return async.retry(
      () => fhc.buildAndroidDebug(
        this.project.guid,
        this.details.guid,
        this.cloudApp.guid,
        config.environment,
        this.platform,
        this.buildType,
        'true',
        this.connection.tag
      ), config.retries)
      .then(build => {
        console.log('');
        this.build = build;
        const buildApk = path.resolve(__dirname, '..', build[1].download.file);
        const buildId = new Date().getTime();
        const buildsFolder = path.resolve(__dirname, `../builds`);
        this.buildFile = path.resolve(buildsFolder, `${buildId}.apk`);
        fs.renameSync(buildApk, this.buildFile);
      });
  }

}

module.exports = AndroidClientApp;
