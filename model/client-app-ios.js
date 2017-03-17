"use strict";

const ClientApp = require('./client-app');
const exec = require('../utils/exec');
const path = require('path');
const studio = require('../utils/studio');
const webdriverio = require('webdriverio');
const options = { desiredCapabilities: { browserName: 'chrome' } };
const client = webdriverio.remote(options);
const config = require('../config/config');
const fhc = require('../utils/fhc');
const rimraf = require('../utils/rimraf');
const fs = require('fs');
const unzip = require('../utils/unzip');
const appiumConfig = require('../config/appium');

class IOSClientApp extends ClientApp {

  constructor(projectTemplateId, clientAppName, test) {
    super(projectTemplateId, clientAppName, 'ios', test);

    this.findDevice = this.findDevice.bind(this);
    this.createCredBundle = this.createCredBundle.bind(this);
    this.build = this.build.bind(this);
  }

  findDevice() {
    return exec('system_profiler SPUSBDataType')
      .then(output => {
        const deviceId = output.stdout.match(/Serial Number: ([\w\d]{40})/);
        if (!deviceId) {
          throw new Error('No connected iOS device found');
        }
        appiumConfig.ios.udid = deviceId[1];
      });
  }

  createCredBundle() {
    return studio.init(client)
      .url(`${config.host}/#projects/${this.project.guid}/apps/${this.clientApp.guid}/credentials`)
      .then(() => (studio.login(client, config.username, config.password)))
      .waitForVisible('#new-bundle-btn')
      .click('#new-bundle-btn')
      .waitForVisible('.platform-selector [data-id="ios"]')
      .click('.platform-selector [data-id="ios"]')
      .waitForVisible('#bundle-name')
      .setValue('#bundle-name', config.prefix + new Date().getTime())
      .waitForVisible('#type')
      .selectByValue('#type', this.buildType)
      .waitForVisible('#private_key')
      .chooseFile('#private_key', path.resolve(__dirname, '..', config.ios[this.buildType].p12))
      .pause(2000)
      .waitForVisible('#cert')
      .chooseFile('#cert', path.resolve(__dirname, '..', config.ios[this.buildType].cer))
      .pause(2000)
      .waitForVisible('#prov_profile')
      .chooseFile('#prov_profile', path.resolve(__dirname, '..', config.ios[this.buildType].provision))
      .pause(2000)
      .waitForVisible('.btn-submit')
      .click('.btn-submit')
      .pause(5000)
      .end()
      .then(this.prepareCredBundle);
  }

  build() {
    const tempFolder = path.resolve(__dirname, '../temp');
    return fhc.buildIOS(
        this.project.guid,
        this.clientApp.guid,
        this.cloudApp.guid,
        this.environment,
        this.buildPlatform,
        this.buildType,
        config.ios[this.buildType].keyPassword,
        config.ios[this.buildType].certPassword,
        'true',
        this.credBundle.id,
        this.connection.tag
      )
      .then(build => {
        this.build = build;
        this.buildZip = path.resolve(__dirname, '..', build[1].download.file);
      })
      .then(() => (rimraf(tempFolder)))
      .then(() => (fs.mkdirSync(tempFolder)))
      .then(() => (unzip(this.buildZip, tempFolder)))
      .then(() => {
        const appfile = fs.readdirSync(tempFolder)[0];
        const ext = path.extname(appfile);
        const buildId = new Date().getTime();
        const buildsFolder = path.resolve(__dirname, `../builds`);
        this.buildFile = path.resolve(buildsFolder, `${buildId}${ext}`);
        if (!fs.existsSync(buildsFolder)) {
          fs.mkdirSync(buildsFolder);
        }
        fs.unlinkSync(this.buildZip);
        fs.renameSync(path.resolve(tempFolder, appfile), this.buildFile);
      });
  }

}

module.exports = IOSClientApp;
