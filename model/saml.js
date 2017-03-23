"use strict";

const path = require('path');
const rimraf = require('../utils/rimraf');
const fhc = require('../utils/fhc');
const config = require('../config/common.json');
const async = require('../utils/async');
const studio = require('../utils/studio');
const fs = require('fs');
const exec = require('../utils/exec');
const samlConfig = require('../config/saml.json');

class SAML {

  constructor(project) {
    this.project = project;
    this.tempFolder = path.resolve(__dirname, '../tempSAML');

    this.prepare = this.prepare.bind(this);
    this._prepareService = this._prepareService.bind(this);
    this._createService = this._createService.bind(this);
    this._deployCloudApp = this._deployCloudApp.bind(this);
    this._tryToReuseExistingService = this._tryToReuseExistingService.bind(this);
    this._findReusableService = this._findReusableService.bind(this);
    this._storeDetails = this._storeDetails.bind(this);
    this._addSP = this._addSP.bind(this);
  }

  prepare() {
    console.log('Preparing SAML');

    return rimraf(this.tempFolder)
      .then(() => fhc.environmentRead(config.environment))
      .then(env => {
        this.environment = env.label;
      })
      .then(this._prepareService)
      .then(() => studio.saml.associateService(this.project))
      .then(() => studio.saml.associateSAML(this.project, this.environment));
  }

  _prepareService() {
    console.log('Preparing SAML service');

    return this._tryToReuseExistingService()
      .then(reused => {
        if (!reused) {
          return this._createService()
            .then(this._deployCloudApp)
            .then(() => studio.saml.setVariables(this))
            .then(() => studio.saml.getExampleUrl(this))
            .then(() => studio.saml.getIssuer(this))
            .then(this._addSP);
        }
      })
      .then(() => {
        this.project.saml = {
          service: this.service,
          serviceId: this.cloudApp.guid
        };
      });
  }

  _createService() {
    console.log('Creating SAML service');

    return async.retry(
      () => fhc.serviceCreate(this.project.details.title, 'saml-service'),
      config.retries
    ).then(this._storeDetails);
  }

  _deployCloudApp() {
    console.log('Deploying SAML cloud app');

    return async.retry(
      () => fhc.appDeploy(this.cloudApp.guid, config.environment),
      config.retries
    );
  }

  _tryToReuseExistingService() {
    console.log('Trying to reuse existing service');

    return fhc.servicesList()
      .then(this._findReusableService)
      .then(reusable => {
        if (reusable) {
          this._storeDetails(reusable);

          return true;
        }

        return false;
      });
  }

  _findReusableService(services) {
    const suitableServices = services.filter(service => {
      const templateMatch = service.jsonTemplateId === 'saml-service';
      const prefixMatch = service.title.startsWith(config.prefix);
      return templateMatch && prefixMatch;
    });

    return async.find(
      suitableServices,
      service => {
        const cloudApp = service.apps.find(app =>
          app.type === 'cloud_nodejs'
        );

        return fhc.ping(cloudApp.guid, config.environment);
      }
    );
  }

  _storeDetails(details) {
    this.service = details;
    this.cloudApp = this.service.apps.find(app =>
      app.type === 'cloud_nodejs'
    );
  }

  _addSP() {
    console.log('Adding SAML SP');

    let samlPod;

    fs.mkdirSync(this.tempFolder);

    return exec(`oc login ${samlConfig.host} --username='${samlConfig.username}' --password='${samlConfig.password}'`)
      .then(() => exec('oc project saml', this.tempFolder))
      .then(() => exec('oc get pods -o json', this.tempFolder))
      .then(pods => {
        samlPod = JSON.parse(pods.stdout).items[0].metadata.name;
      })
      .then(() =>
        exec(`oc rsync ${samlPod}:/var/simplesamlphp/metadata/ .`, this.tempFolder)
      )
      .then(() =>
        fs.appendFileSync(
          path.resolve(this.tempFolder, 'saml20-sp-remote.php'),
          `
          $metadata['${this.issuer}'] = array(
            'AssertionConsumerService' => '${this.issuer}',
          );`
        )
      )
      .then(() =>
        exec(`oc rsync ./ ${samlPod}:/var/simplesamlphp/metadata`, this.tempFolder)
      );
  }

}

module.exports = SAML;
