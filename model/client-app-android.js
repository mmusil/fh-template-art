"use strict";

const fhc = require('../utils/fhc');
const fs = require('fs');
const ClientApp = require('./client-app');
const path = require('path');
const config = require('../config/config');

class AndroidClientApp extends ClientApp {

  constructor(projectTemplateId, clientAppName, test, cordova) {
    super(projectTemplateId, clientAppName, 'android', test, cordova);

    this.prepareSAML = this.prepareSAML.bind(this);
    this.preparePush = this.preparePush.bind(this);
    this.createCredBundle = this.createCredBundle.bind(this);
    this.build = this.build.bind(this);
  }

  prepareSAML() {

  }

  preparePush() {

  }

  createCredBundle() {

  }

  build() {
    console.log('Building client app');

    return fhc.buildAndroidDebug(
        this.project.guid,
        this.details.guid,
        this.cloudApp.guid,
        config.environment,
        this.platform,
        this.buildType,
        'true',
        this.connection.tag
      )
      .then(build => {
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
