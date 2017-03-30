"use strict";

const wd = require('wd');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
const appiumConfig = require('../config/appium');
const config = require('../config/common.json');
const async = require('../utils/async');
const path = require('path');
const fs = require('fs');

let running = false;

function init(clientApp) {
  if (running) {
    return Promise.resolve();
  }

  console.log('Initializing appium');

  wd.addPromiseChainMethod('swipe', swipe);

  clientApp.driver = wd.promiseChainRemote(appiumConfig.server);

  appiumConfig[clientApp.platform].app = clientApp.buildFile;

  return async.retry(
    () => clientApp.driver.init(appiumConfig[clientApp.platform]),
    config.retries
  ).then(() => {
    running = true;

    if (clientApp.cordova) {
      return this.webviewContext();
    }
  })
  // wait for the app to initialize
  .then(() =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 10000);
    })
  );
}

function finish(driver) {
  if (driver && running) {
    running = false;

    return driver.quit()
      .catch(console.error);
  }
}

function takeScreenshot(driver) {
  const logFolder = path.resolve(__dirname, '../logs');
  const timeStamp = new Date().getTime().toString();
  const pngFile = path.resolve(logFolder, timeStamp + '.png');

  return driver
    .takeScreenshot()
    .then(() => {
      if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder);
      }
    })
    .saveScreenshot(pngFile);
}

function webviewContext(driver) {
  return driver.contexts()
    .then(contexts =>
      driver.context(contexts[1])
    );
}

function swipe(opts) {
  var action = new wd.TouchAction();
  action
    .press({x: opts.startX, y: opts.startY})
    .wait(opts.duration)
    .moveTo({x: opts.endX, y: opts.endY})
    .release();
  return this.performTouchAction(action);
}

module.exports = {
  init: init,
  finish: finish,
  takeScreenshot: takeScreenshot,
  webviewContext: webviewContext
};
