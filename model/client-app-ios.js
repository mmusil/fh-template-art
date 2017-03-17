"use strict";

const ClientApp = require('./client-app');
const exec = require('../utils/exec');
const path = require('path');
const studio = require('../utils/studio');
const config = require('../config/config');
const fhc = require('../utils/fhc');
const rimraf = require('../utils/rimraf');
const fs = require('fs');
const unzip = require('../utils/unzip');
const appiumConfig = require('../config/appium');
const git = require('../utils/git');

class IOSClientApp extends ClientApp {

  constructor(projectTemplateId, clientAppName, test, push, scheme, bundleId) {
    super(projectTemplateId, clientAppName, 'ios', test, push);

    this.scheme = scheme;
    this.bundleId = bundleId;

    this.preparePush = this.preparePush.bind(this);
    this.changeBundleId = this.changeBundleId.bind(this);
    this.findDevice = this.findDevice.bind(this);
    this.createCredBundle = this.createCredBundle.bind(this);
    this.build = this.build.bind(this);
  }

  preparePush() {
    return this.changeBundleId()
      .then(() => (studio.ios.enablePush(this)));
  }

  changeBundleId() {
    const tempFolder = path.resolve(__dirname, '../temp');
    const pbxprojFile = path.resolve(tempFolder, this.scheme + '.xcodeproj', 'project.pbxproj');
    return rimraf(tempFolder)
      .then(() => (git.clone(this.clientApp.scmUrl, tempFolder, 'master')))
      .then(() => {
        const pbxproj = fs.readFileSync(pbxprojFile, 'utf8');
        const replaced = pbxproj.split(this.bundleId).join(config.ios.push.BundleId);
        fs.writeFileSync(pbxprojFile, replaced);
      })
      .then(() => (git.add(`${this.scheme}.xcodeproj/project.pbxproj`, tempFolder)))
      .then(() => (git.commit('Updated bundleId', tempFolder)))
      .then(() => (git.push('origin', 'master', tempFolder)));
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
    const credentials = this.push ? config.ios.push[this.buildType] : config.ios[this.buildType];
    this.credentials = {
      key: path.resolve(__dirname, '..', credentials.p12),
      cer: path.resolve(__dirname, '..', credentials.cer),
      prov: path.resolve(__dirname, '..', credentials.provision),
      keyPassword: credentials.keyPassword,
      certPassword: credentials.certPassword
    };
    return studio.ios.createCredBundle(this)
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
        this.credentials.keyPassword,
        this.credentials.certPassword,
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
