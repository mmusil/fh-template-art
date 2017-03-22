"use strict";

const path = require('path');
const rimraf = require('../utils/rimraf');
const fhc = require('../utils/fhc');
const config = require('../config/config');
const async = require('../utils/async');

class SAMLPreparer {

  constructor(clientApp) {
    this.clientApp = clientApp;
    this.tempFolder = path.resolve(__dirname, '../tempSAML');

    this.prepare = this.prepare.bind(this);
  }

  prepare() {
    return rimraf(this.tempFolder)
      .then(() => fhc.environmentRead(config.environment))
      .then(env => {
        this.environmentName = env.label;
      })
      .then(fhc.servicesList)
      .then(this.prepareService)
      .then(() => studio.associateService(this))
      .then(() => studio.associateSAML(this))
  }

  _prepareService() {
    return this._tryToReuseExistingService()
      .then(reused => {
        if (!reused) {
          return this._createService()
            .then(this.deployCloudApp);
        }
      })
      .then(() => {
        this.clientApp.SAML = {
          service: this.service,
          serviceId: this.service.apps[0].guid
        }
      });
  }

  _createService() {
    return async.retry(
      fhc.serviceCreate(this.clientApp.project.title, 'saml-service'),
      config.retries
    ).then(service => {
      this._storeDetails(service);
    });
  }

  _deployCloudApp() {
    return async.retry(
      fhc.appDeploy(this.cloudApp.guid, config.environment),
      config.retries
    );
  }

  _tryToReuseExistingService() {
    let reusable;

    return fhc.servicesList()
      .then(this._filterReusableServices)
      .then(result => {
        reusable = result;

        if (reusable.length === 0) {
          return false;
        }

        return this._findRunningCloudApp(reusable);
      })
      .then(serviceWithRunningCloudApp => {
        if (serviceWithRunningCloudApp) {
          this._storeDetails(serviceWithRunningCloudApp);

          return true;
        }

        this._storeDetails(reusable[0]);

        return this._deployCloudApp()
          .then(() => true);
      });
  }

  _filterReusableServices(services) {
    return services.filter(service => {
      const templateMatch = service.jsonTemplateId === 'saml-service';
      const prefixMatch = service.title.startsWith(config.prefix);
      return templateMatch && prefixMatch;
    });
  }

  _findRunningCloudApp(services) {
    return async.find(
      services,
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

}

module.exports = SAMLPreparer;
