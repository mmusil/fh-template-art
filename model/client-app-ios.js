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
const plist = require('plist');

class IOSClientApp extends ClientApp {

  constructor(projectTemplateId, clientAppName, test, cordova, scheme, bundleId) {
    super(projectTemplateId, clientAppName, 'ios', test, cordova);

    this.scheme = scheme;
    this.bundleId = bundleId;

    this.prepareSAMLPlatSpecific = this.prepareSAMLPlatSpecific.bind(this);
    this.preparePush = this.preparePush.bind(this);
    this.editFile = this.editFile.bind(this);
    this.changeBundleId = this.changeBundleId.bind(this);
    this.allowArbitraryLoads = this.allowArbitraryLoads.bind(this);
    this.allowArbitraryLoadsCordova = this.allowArbitraryLoadsCordova.bind(this);
    this.findDevice = this.findDevice.bind(this);
    this.createCredBundle = this.createCredBundle.bind(this);
    this.build = this.build.bind(this);
  }

  prepareSAMLPlatSpecific() {
    if (this.clientAppName === 'SAML iOS (Objective-C)') {
      return this.allowArbitraryLoads();
    }
    if (this.clientAppName === 'SAML Client') {
      return this.allowArbitraryLoadsCordova();
    }
  }

  preparePush() {
    return this.changeBundleId()
      .then(() => studio.ios.enablePush(this));
  }

  editFile(fileName, editFunc) {
    const tempFolder = path.resolve(__dirname, '../temp');
    const file = path.resolve(tempFolder, fileName);
    return rimraf(tempFolder)
      .then(() => git.clone(this.clientApp.internallyHostedRepoUrl, tempFolder, 'master'))
      .then(() => editFunc(file))
      .then(() => git.add(fileName, tempFolder))
      .then(() => git.commit('Updated bundleId', tempFolder))
      .then(() => git.push('origin', 'master', tempFolder))
      .then(() => studio.pullApp(this));
  }

  changeBundleId() {
    return this.editFile(`${this.scheme}.xcodeproj/project.pbxproj`, file => {
      const pbxproj = fs.readFileSync(file, 'utf8');
      const replaced = pbxproj.split(this.bundleId).join(config.ios.push[this.buildType].bundleId);
      fs.writeFileSync(file, replaced);
    });
  }

  allowArbitraryLoads() {
    return this.editFile(`${this.scheme}/${this.scheme}-Info.plist`, file => {
      const plistData = plist.parse(fs.readFileSync(file, 'utf8'));
      plistData.NSAppTransportSecurity = {
        NSAllowsArbitraryLoads: true
      };
      fs.writeFileSync(file, plist.build(plistData));
    });
  }

  allowArbitraryLoadsCordova() {
    return this.editFile(`${this.scheme}/${this.scheme}-Info.plist`, file => {
      const plistData = plist.parse(fs.readFileSync(file, 'utf8'));
      plistData.NSAppTransportSecurity = {
        NSAllowsArbitraryLoads: true
      };
      fs.writeFileSync(file, plist.build(plistData));
    });
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
    this.credentials = {
      key: path.resolve(__dirname, '..', this.credConfig.key),
      cer: path.resolve(__dirname, '..', this.credConfig.cer),
      prov: path.resolve(__dirname, '..', this.credConfig.provision)
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
        this.credConfig.keyPassword,
        this.credConfig.certPassword,
        'true',
        this.credBundle.id,
        this.connection.tag
      )
      .then(build => {
        this.build = build;
        this.buildZip = path.resolve(__dirname, '..', build[1].download.file);
      })
      .then(() => rimraf(tempFolder))
      .then(() => fs.mkdirSync(tempFolder))
      .then(() => unzip(this.buildZip, tempFolder))
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
