"use strict";

const ClientApp = require('./client-app');
const path = require('path');
const studio = require('../utils/studio');
const config = require('../config/common.json');
const fhc = require('../utils/fhc');
const rimraf = require('../utils/rimraf');
const fs = require('fs');
const unzip = require('../utils/unzip');
const plist = require('plist');
const xml2js = require('../utils/xml2js');
const credConfig = require('../config/credentials.json');
const async = require('../utils/async');
const push = require('../utils/push');
const bfCleanup = require('../utils/bf-cleanup');

class IOSClientApp extends ClientApp {

  constructor(projectTemplateId, clientAppName, test, type, scheme, bundleId, repo, branch) {
    super(projectTemplateId, clientAppName, 'ios', test, type, repo, branch);

    this.scheme = scheme;
    this.bundleId = bundleId;

    this.cleanup = this.cleanup.bind(this);
    this.prepareSAML = this.prepareSAML.bind(this);
    this.preparePush = this.preparePush.bind(this);
    this.changeBundleId = this.changeBundleId.bind(this);
    this.allowArbitraryLoads = this.allowArbitraryLoads.bind(this);
    this.allowArbitraryLoadsCordova = this.allowArbitraryLoadsCordova.bind(this);
    this.createCredBundle = this.createCredBundle.bind(this);
    this.build = this.build.bind(this);
  }

  cleanup() {
    if (this.buildId) {
      return bfCleanup(this.buildId);
    }
  }

  prepareSAML() {
    if (this.name === 'SAML iOS (Objective-C)') {
      return this.allowArbitraryLoads();
    }
    if (this.name === 'SAML Client') {
      return this.allowArbitraryLoadsCordova();
    }
  }

  preparePush() {
    console.log('Preparing push');

    return this.changeBundleId()
      .then(() => push.startPush(this,credConfig.ios.push,'ios','ios'))
      .then(pushCred => {
        this.pushCred = pushCred;
      });
  }

  changeBundleId() {
    return this.editFile(`${this.scheme}.xcodeproj/project.pbxproj`, file => {
      const pbxproj = fs.readFileSync(file, 'utf8');
      const replaced = pbxproj.split(this.bundleId).join(credConfig.ios.push.bundleId);
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
    return this.editFile(`config.xml`, file =>
      xml2js.parse(fs.readFileSync(file, 'utf8'))
        .then(config => {
          config.widget.access.push({
            $: {
              origin: '*',
              'allows-arbitrary-loads-in-media': 'true',
              'allows-arbitrary-loads-in-web-content': 'true',
              'allows-local-networking': 'true'
            }
          });
          fs.writeFileSync(file, xml2js.build(config));
        })
    );
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
    console.log('Building client app');

    const tempFolder = path.resolve(__dirname, '../temp');

    return async.retry(
      () => fhc.buildIOS(
        this.project.guid,
        this.details.guid,
        this.cloudApp.guid,
        config.environment,
        this.platform,
        this.buildType,
        this.credConfig.password,
        this.credConfig.password,
        'true',
        this.credBundle.id,
        this.connection.tag
      ), config.retries)
      .then(build => {
        console.log('');
        this.buildId = build[0][0].cacheKey;
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
