"use strict";

const webdriverio = require('webdriverio');
const options = { desiredCapabilities: { browserName: 'chrome' } };
const config = require('../config/common.json');
const samlConfig = require('../config/saml.json');

let client;

const implicitTimeout = 60000;

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
  client = webdriverio.remote(options);
  return client
    .init()
    .setViewportSize({ width: 1024, height: 768 })
    .timeouts('implicit', implicitTimeout);
}

function enablePushIOS(clientApp) {
  return init()
    .url(`${config.host}/#projects/${clientApp.project.guid}/apps/${clientApp.details.guid}/push`)
    .then(() => login(config.username, config.password))
    .waitForVisible('#ups-app-detail-root button')
    .timeouts('implicit', 1000)
    .isExisting('#add-variant-btn')
    .then(visible => {
      if (visible) {
        return client
          .timeouts('implicit', implicitTimeout)
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
          .then(() => setupPushIOS(clientApp.credConfig.p12, clientApp.credConfig.p12Password, clientApp.buildType))
          .waitForVisible('.modal-footer button.btn-primary')
          .click('.modal-footer button.btn-primary')
          .pause(3000);
      } else {
        return client
          .timeouts('implicit', implicitTimeout)
          .click('#ups-app-detail-root button')
          .then(() => setupPushIOS(clientApp.credConfig.p12, clientApp.credConfig.p12Password, clientApp.buildType))
          .waitForVisible('#enablePush')
          .click('#enablePush');
      }
    })
    .end();
}

function setupPushIOS(p12, pass, type) {
  return client
    .waitForVisible('.ups-variant-ios')
    .click('.ups-variant-ios')
    .waitForVisible('.ups-add-variable input[type="file"]')
    .chooseFile('.ups-add-variable input[type="file"]', p12)
    .then(() => {
      if (type === 'debug') {
        return client
          .waitForVisible('#iosType2')
          .click('#iosType2');
      } else {
        return client
          .waitForVisible('#iosType1')
          .click('#iosType1');
      }
    })
    .waitForVisible('#iosPassphrase')
    .setValue('#iosPassphrase', pass)
    .pause(2000);
}

function createCredBundleIOS(clientApp) {
  return init()
    .url(`${config.host}/#projects/${clientApp.project.guid}/apps/${clientApp.details.guid}/credentials`)
    .then(() => login(config.username, config.password))
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
  return init()
    .url(`${config.host}/#projects/${clientApp.project.guid}/apps/${clientApp.details.guid}/push`)
    .then(() => login(config.username, config.password))
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
  return init()
    .url(`${config.host}/#projects/new`)
    .then(() => login(config.username, config.password))
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
    .pause(30000)
    .waitForVisible('.bar-success')
    .waitForVisible('.finish')
    .click('.finish')
    .end();
}

function setSAMLVariables(saml) {
  return init()
    .url(`${config.host}/#/services/${saml.service.guid}/apps/${saml.cloudApp.guid}/environment_variables`)
    .then(() => login(config.username, config.password))
    .pause(10000)
    .then(() => selectEnvironment(saml.environment))
    .then(() => addVariable('SAML_ENTRY_POINT', samlConfig.entryPoint))
    .then(() => addVariable('SAML_AUTH_CONTEXT', samlConfig.authContext))
    .then(() => addVariable('SAML_CERT', samlConfig.cert))
    .then(() => pushVariables())
    .end();
}

function getSAMLExampleUrl(saml) {
  return init()
    .url(`${config.host}/#/services/${saml.service.guid}/apps/${saml.cloudApp.guid}/preview`)
    .then(() => login(config.username, config.password))
    .pause(10000)
    .then(() => selectEnvironment(saml.environment))
    .waitForVisible('.cloud-url')
    .getText('.cloud-url')
    .then(samlExampleUrl => {
      saml.exampleUrl = samlExampleUrl;
    })
    .end();
}

function getSAMLIssuer(saml) {
  return init()
    .url(saml.exampleUrl)
    .waitForVisible('tbody tr:first-child td:nth-child(2)')
    .getText('tbody tr:first-child td:nth-child(2)')
    .then(issuer => {
      saml.issuer = issuer;
    })
    .end();
}

function associateService(project) {
  return init()
    .url(`${config.host}/#/projects/${project.details.guid}/apps`)
    .then(() => login(config.username, config.password))
    .waitForVisible('.associate_services')
    .pause(5000)
    .timeouts('implicit', 1000)
    .element('#connectors_list').isVisible(`.item_title*=${project.saml.service.title}`)
    .then(associated => {
      if (!associated) {
        return client
          .timeouts('implicit', implicitTimeout)
          .click('.associate_services')
          .waitForVisible(`div.title=${project.saml.service.title}`)
          .click(`div.title=${project.saml.service.title}`)
          .waitForVisible('.save_btn')
          .click('.save_btn');
      }
    })
    .end();
}

function associateSAML(project, environment) {
  return init()
    .url(`${config.host}/#/projects/${project.details.guid}/apps/${project.cloudApp.guid}/environment_variables`)
    .then(() => login(config.username, config.password))
    .then(() => selectEnvironment(environment))
    .pause(2000)
    .timeouts('implicit', 1000)
    .element('#app-env-vars-list').isVisible('td=SAML_SERVICE')
    .then(visible => {
      if (visible) {
        return client
          .timeouts('implicit', implicitTimeout)
          .element('#app-env-vars-list').click('td=SAML_SERVICE')
          .pause(2000);
      } else {
        return client
          .timeouts('implicit', implicitTimeout)
          .waitForVisible('.add_env_var_btn')
          .click('.add_env_var_btn')
          .pause(2000)
          .waitForVisible('#name')
          .setValue('#name', 'SAML_SERVICE');
      }
    })
    .waitForVisible('#env_var_value')
    .clearElement('#env_var_value')
    .setValue('#env_var_value', project.saml.serviceId)
    .waitForVisible('.save_env_var_btn')
    .click('.save_env_var_btn')
    .pause(2000)
    .then(() => pushVariables())
    .end();
}

function pullApp(clientApp) {
  return init()
    .url(`${config.host}/#/projects/${clientApp.project.guid}/apps/${clientApp.details.guid}/editor`)
    .then(() => login(config.username, config.password))
    .waitForVisible('.gitpull_btn')
    .click('.gitpull_btn')
    .pause(5000)
    .end();
}

function checkDataBrowser(clientApp, value, removeAll) {
  const elem = value ? `td=${value}` : '.emptyContainer';
  return init()
    .url(`${config.host}/#/projects/${clientApp.project.guid}/apps/${clientApp.cloudApp.guid}/databrowser`)
    .then(() => login(config.username, config.password))
    .then(() => selectEnvironment(clientApp.environment))
    .waitForVisible('#databrowser_container h3')
    .click('#databrowser_container h3')
    .pause(4000)
    .waitForVisible(elem)
    .then(() => {
      if (removeAll) {
        return client
          .waitForVisible('.btn-danger')
          .click('.btn-danger')
          .waitForVisible('.btn-trash-all-rows')
          .click('.btn-trash-all-rows')
          .pause(2000)
          .waitForVisible('#modal-ok')
          .click('#modal-ok')
          .pause(2000);
      }
    })
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
  createHelloWorldProject: createHelloWorldProject,
  saml: {
    setVariables: setSAMLVariables,
    getExampleUrl: getSAMLExampleUrl,
    getIssuer: getSAMLIssuer,
    associateService: associateService,
    associateSAML: associateSAML
  },
  pullApp: pullApp,
  checkDataBrowser: checkDataBrowser
};
