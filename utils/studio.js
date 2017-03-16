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
    .timeouts('implicit', 20000);
}

function enablePush(clientApp) {
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
            .then(this.setupPush)
            .waitForVisible('.modal-footer button.btn-primary')
            .click('.modal-footer button.btn-primary')
            .pause(3000);
        } else {
          return client
            .click('#ups-app-detail-root button')
            .then(this.setupPush)
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

module.exports = {
  login: login,
  selectEnvironment: selectEnvironment,
  addVariable: addVariable,
  pushVariables: pushVariables,
  init: init,
  enablePush: enablePush
};
