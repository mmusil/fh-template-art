"use strict";

const async = require('../utils/async');
const fhc = require('../utils/fhc');
const config = require('../config/common.json');
const SAML = require('./saml');

class Project {

  constructor(clientApp) {
    this.clientApp = clientApp;
    this.templateId = clientApp.projectTemplateId;

    this.prepare = this.prepare.bind(this);
    this._prepareClientApp = this._prepareClientApp.bind(this);
    this._create = this._create.bind(this);
    this._deployCloudApp = this._deployCloudApp.bind(this);
    this._tryToReuseExisting = this._tryToReuseExisting.bind(this);
    this._filterReusable = this._filterReusable.bind(this);
    this._findRunningCloudApp = this._findRunningCloudApp.bind(this);
    this._storeDetails = this._storeDetails.bind(this);
  }

  prepare() {
    console.log('Preparing project');

    return this._tryToReuseExisting()
      .then(reused => {
        if (!reused) {
          return this._create()
            .then(this._deployCloudApp);
        }
      })
      .then(this._prepareClientApp)
      .then(() => {
        this.clientApp.project = this.details;
        this.clientApp.cloudApp = this.cloudApp;
      })
      .then(() => {
        if (this.templateId === 'saml_project') {
          const saml = new SAML(this);

          return saml.prepare();
        }
      });
  }

  _prepareClientApp() {
    const app = this.details.apps.find(app => app.title === this.clientApp.name);

    if (this.clientApp.repo && !app) {
      console.log('Importing client app');

      return fhc.importApp(
        this.details.guid,
        this.clientApp.name,
        this.clientApp.type,
        this.clientApp.repo,
        this.clientApp.branch,
        config.environment
      ).then(app => {
        this.details.apps.push(app);
      });
    }
  }

  _create() {
    console.log('Creating project');

    const projectName = config.prefix + new Date().getTime();

    return async.retry(
      () => fhc.createProject(projectName, this.templateId),
      config.retries
    ).then(this._storeDetails);
  }

  _deployCloudApp() {
    console.log('Deploying cloudApp');

    return async.retry(
      () => fhc.appDeploy(this.cloudApp.guid, config.environment),
      config.retries
    );
  }

  _tryToReuseExisting() {
    console.log('Trying to reuse existing project');

    let reusable;

    return fhc.projectsListNoApps()
      .then(this._filterReusable)
      .then(result => {
        reusable = result;

        return this._findRunningCloudApp(reusable);
      })
      .then(projectWithRunningCloudApp => {
        if (projectWithRunningCloudApp) {
          this._storeDetails(projectWithRunningCloudApp);

          return true;
        }

        if (reusable.length === 0) {
          return false;
        }

        this._storeDetails(reusable[0]);

        return this._deployCloudApp()
          .then(() => true);
      });
  }

  _filterReusable(projects) {
    const suitableProjects = projects.filter(project => {
      const templateMatch = project.jsonTemplateId === this.templateId;
      const prefixMatch = project.title.startsWith(config.prefix);
      return templateMatch && prefixMatch;
    });

    return async.sequence(
      suitableProjects,
      project => fhc.projectRead(project.guid)
        .then(projectDetails => {
          project.apps = projectDetails.apps;
        })
    ).then(() => {
      if (this.clientApp.repo) {
        return suitableProjects;
      }

      return suitableProjects.filter(project =>
        project.apps.find(app =>
          app.title === this.clientApp.name
        )
      );
    });
  }

  _findRunningCloudApp(projects) {
    return async.find(
      projects,
      project => {
        const cloudApp = project.apps.find(app =>
          app.type === 'cloud_nodejs'
        );

        return fhc.ping(cloudApp.guid, config.environment);
      }
    );
  }

  _storeDetails(details) {
    this.details = details;
    this.cloudApp = this.details.apps.find(app =>
      app.type === 'cloud_nodejs'
    );
  }

}

module.exports = Project;
