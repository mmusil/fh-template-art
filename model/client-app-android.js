"use strict";

const fhc = require('../utils/fhc');
const fs = require('fs');
const ClientApp = require('./client-app');
const path = require('path');

class AndroidClientApp extends ClientApp {

  constructor(projectTemplateId, clientAppName, test) {
    super(projectTemplateId, clientAppName, 'android', test);

    this.createCredBundle = this.createCredBundle.bind(this);
    this.build = this.build.bind(this);
  }

  createCredBundle() {

  }

  build() {
    return fhc.buildAndroidDebug(
        this.project.guid,
        this.clientApp.guid,
        this.cloudApp.guid,
        this.environment,
        this.buildPlatform,
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
