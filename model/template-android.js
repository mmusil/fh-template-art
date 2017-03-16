"use strict";

const fhc = require('../utils/fhc');
const fs = require('fs');
const Template = require('./template');
const wd = require('wd');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
const config = require('../config/appium');
const exec = require('../utils/exec');
const path = require('path');

class IOSTemplate extends Template {

  constructor(projectTemplateId, clientAppName, buildType) {
    super(projectTemplateId, clientAppName, 'android', buildType);

    this.initAppium = this.initAppium.bind(this);
    this.cleanup = this.cleanup.bind(this);
    this.buildClientApp = this.buildClientApp.bind(this);
  }

  initAppium() {
    this.driver = wd.promiseChainRemote(config.server);
    config.android.app = this.buildFile;
    return this.driver.init(config.android);
  }

  cleanup() {
    return super.cleanup()
      .then(this.driver.guit);
  }

  buildClientApp() {
    const tempFolder = path.resolve(__dirname, '../temp');
    return fhc.buildAndroid(
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

module.exports = IOSTemplate;
