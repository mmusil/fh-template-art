"use strict";

const webdriverio = require('webdriverio');
const options = { desiredCapabilities: { browserName: 'chrome' } };
const client = webdriverio.remote(options);
const config = require('../config/config');

function login(username, password) {
  return client
    .waitForVisible('#username')
    .setValue('#username', username)
    .waitForVisible('#password')
    .setValue('#password', password)
    .waitForVisible('#login_button')
    .click('#login_button');
}

function selectEnvironment(env) {
  return client
    .waitForVisible('.environment-selector .caret')
    .pause(2000)
    .click('.environment-selector .caret')
    .pause(2000)
    .element('.environment_selector_container ul.dropdown-menu').waitForVisible(`.text=${env}`)
    .element('.environment_selector_container ul.dropdown-menu').click(`.text=${env}`)
    .waitForVisible('.environment_selector_container .btn-success');
}

function addVariable(varName, varValue) {
  return client
    .waitForVisible('.add_env_var_btn')
    .click('.add_env_var_btn')
    .pause(2000)
    .waitForVisible('#app-env-variables div:last-of-type .modal #name')
    .setValue('#app-env-variables div:last-of-type .modal #name', varName)
    .waitForVisible('#app-env-variables div:last-of-type .modal #env_var_value')
    .setValue('#app-env-variables div:last-of-type .modal #env_var_value', varValue)
    .waitForVisible('#app-env-variables div:last-of-type .modal .save_env_var_btn')
    .click('#app-env-variables div:last-of-type .modal .save_env_var_btn')
    .pause(2000);
}

function pushVariables() {
  return client
    .waitForVisible('.push_env_var_btn')
    .click('.push_env_var_btn')
    .pause(2000)
    .waitForVisible('.confirm')
    .click('.confirm');
}

function init() {
  return client
    .init()
    .setViewportSize({ width: 1024, height: 768 })
    .timeouts('implicit', 60000);
}

function enablePushIOS(clientApp) {
  return init(client)
      .url(`${config.host}/#projects/${clientApp.project.guid}/apps/${clientApp.clientApp.guid}/push`)
      .then(() => (login(config.username, config.password)))
      .waitForVisible('#ups-app-detail-root button')
      .isVisible('#add-variant-btn')
      .then(visible => {
        if (visible) {
          return client
            .waitForVisible('.ups-variant-header')
            .moveToObject('.ups-variant-header')
            .waitForVisible('.ups-variant-header .actions .danger a')
            .click('.ups-variant-header .actions .danger a')
            .pause(3000)
            .waitForVisible('input[ng-model="confirmVariantName"]')
            .setValue('input[ng-model="confirmVariantName"]', 'ios')
            .waitForVisible('.modal-dialog button[type="submit"]')
            .click('.modal-dialog button[type="submit"]')
            .pause(3000)
            .waitForVisible('#add-variant-btn')
            .click('#add-variant-btn')
            .pause(3000)
            .waitForVisible('#textInput-modal-markup')
            .setValue('#textInput-modal-markup', 'ios')
            .then(() => (setupPushIOS(clientApp.credConfig.p12, clientApp.credConfig.p12Password)))
            .waitForVisible('.modal-footer button.btn-primary')
            .click('.modal-footer button.btn-primary')
            .pause(3000);
        } else {
          return client
            .click('#ups-app-detail-root button')
            .then(() => (setupPushIOS(clientApp.credConfig.p12, clientApp.credConfig.p12Password)))
            .waitForVisible('#enablePush')
            .click('#enablePush');
        }
      })
      .waitForVisible('.variant-id')
      .getText('.variant-id')
      .then(variantId => {
        this.pushVariantId = variantId;
      })
      .waitForVisible('.variant-secret')
      .getText('.variant-secret')
      .then(variantSecret => {
        this.pushVariantSecret = variantSecret.split('\n')[0];
      })
      .end();
}

function setupPushIOS(p12, pass) {
  return client
    .waitForVisible('.ups-variant-ios')
    .click('.ups-variant-ios')
    .waitForVisible('.ups-add-variable input[type="file"]')
    .chooseFile('.ups-add-variable input[type="file"]', p12)
    .waitForVisible('#iosType2')
    .click('#iosType2')
    .waitForVisible('#iosPassphrase')
    .setValue('#iosPassphrase', pass);
}

function createCredBundleIOS(clientApp) {
  return init(client)
    .url(`${config.host}/#projects/${clientApp.project.guid}/apps/${clientApp.clientApp.guid}/credentials`)
    .then(() => (login(config.username, config.password)))
    .waitForVisible('#new-bundle-btn')
    .click('#new-bundle-btn')
    .waitForVisible('.platform-selector [data-id="ios"]')
    .click('.platform-selector [data-id="ios"]')
    .waitForVisible('#bundle-name')
    .setValue('#bundle-name', config.prefix + (clientApp.push ? 'push-' : 'normal-') + new Date().getTime())
    .waitForVisible('#type')
    .selectByValue('#type', clientApp.buildType)
    .waitForVisible('#private_key')
    .chooseFile('#private_key', clientApp.credentials.key)
    .pause(2000)
    .waitForVisible('#cert')
    .chooseFile('#cert', clientApp.credentials.cer)
    .pause(2000)
    .waitForVisible('#prov_profile')
    .chooseFile('#prov_profile', clientApp.credentials.prov)
    .pause(2000)
    .waitForVisible('.btn-submit')
    .click('.btn-submit')
    .pause(5000)
    .end();
}

function sendPushNotification(clientApp) {
  return init(client)
    .url(`${config.host}/#projects/${clientApp.project.guid}/apps/${clientApp.clientApp.guid}/push`)
    .then(() => (login(config.username, config.password)))
    .then(waitForDeviceRegistered)
    .waitForVisible('#send-notification-btn')
    .click('#send-notification-btn')
    .pause(3000)
    .waitForVisible('#pushAlert')
    .setValue('#pushAlert', 'test')
    .waitForVisible('#sendPush')
    .click('#sendPush')
    .end();
}

function waitForDeviceRegistered() {
  return client
    .pause(4000)
    .refresh()
    .waitForVisible('#stat-device-count span.count')
    .getText('#stat-device-count span.count')
    .then(numReg => {
      if (Number(numReg) <= 0) {
        return waitForDeviceRegistered();
      }
    });
}

function createHelloWorldProject(name) {
  return init(client)
    .url(`${config.host}/#projects/new`)
    .then(() => (login(config.username, config.password)))
    .waitForVisible('.search-query')
    .setValue('.search-query', 'hello')
    .waitForVisible('.choose-template')
    .click('.choose-template')
    .pause(2000)
    .waitForVisible('.template-name')
    .setValue('.template-name', name)
    .moveToObject('#app-template-helloworld_native_android_gradle_client')
    .waitForVisible('#app-template-native_ios_swift_helloworld_app .include-app')
    .click('#app-template-native_ios_swift_helloworld_app .include-app')
    .waitForVisible('#app-template-native_ios_objectivec_helloworld_app .include-app')
    .click('#app-template-native_ios_objectivec_helloworld_app .include-app')
    .waitForVisible('#app-template-helloworld_native_android_gradle_client .include-app')
    .click('#app-template-helloworld_native_android_gradle_client .include-app')
    .moveToObject('.template-selector-footer')
    .waitForVisible('.create-button')
    .click('.create-button')
    .waitForVisible('.bar-success')
    .waitForVisible('.finish')
    .click('.finish')
    .end();
}

module.exports = {
  login: login,
  selectEnvironment: selectEnvironment,
  addVariable: addVariable,
  pushVariables: pushVariables,
  init: init,
  ios: {
    enablePush: enablePushIOS,
    createCredBundle: createCredBundleIOS
  },
  sendPushNotification: sendPushNotification,
  createHelloWorldProject: createHelloWorldProject
};
