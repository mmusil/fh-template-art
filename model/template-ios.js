"use strict";

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
    super(projectTemplateId, clientAppName, 'ios', buildType);

    this.prepare = this.prepare.bind(this);
    this.initAppium = this.initAppium.bind(this);
    this.findDevice = this.findDevice.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }

  prepare() {
    this.buildFile = path.resolve(__dirname, '../builds/1489663697569.app');
    return Promise.resolve()//super.prepare()
      .then(this.initAppium);
  }

  initAppium() {
    this.driver = wd.promiseChainRemote(config.server);
    config.ios.app = this.buildFile;
    return this.findDevice()
      .then(() => (this.driver.init(config.ios)));
  }

  findDevice() {
    return exec('system_profiler SPUSBDataType')
      .then(output => {
        const deviceId = output.stdout.match(/Serial Number: ([\w\d]{40})/);
        if (!deviceId) {
          throw new Error('No connected iOS device found');
        }
        config.ios.udid = deviceId[1];
      });
  }

  cleanup() {
    return super.cleanup()
      .then(this.driver.guit);
  }

}

module.exports = IOSTemplate;
