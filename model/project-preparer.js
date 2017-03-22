"use strict";

const async = require('../utils/async');
const fhc = require('../utils/fhc');
const config = require('../config/config');
const studio = require('../utils/studio');

class ProjectPreparer {

  constructor(clientApp) {
    this.clientApp = clientApp;
    this.templateId = clientApp.projectTemplateId;

    this.prepare = this.prepare.bind(this);
    this._create = this._create.bind(this);
    this._deployCloudApp = this._deployCloudApp.bind(this);
    this._tryToReuseExisting = this._tryToReuseExisting.bind(this);
    this._filterReusable = this._filterReusable.bind(this);
    this._findRunningCloudApp = this._findRunningCloudApp.bind(this);
    this._storeDetails = this._storeDetails.bind(this);
  }

  prepare() {
    return this._tryToReuseExisting()
      .then(reused => {
        if (!reused && !this.stop) {
          return this._create();
        }
      })
      .then(() => this.details);
  }

  _create() {
    const projectName = config.prefix + new Date().getTime();

    if (this.templateId === 'hello_world_project') {
      this.stop = true;

      return studio.createHelloWorldProject(projectName)
        .then(this.prepare);
    }

    return async.retry(
      fhc.projectCreate(projectName, this.templateId),
      config.retries
    ).then(project => {
      this.details = project;
    });
  }

  _deployCloudApp() {
    return async.retry(
      fhc.appDeploy(this.cloudApp.guid, config.environment),
      config.retries
    );
  }

  _tryToReuseExisting() {
    let reusable;

    return fhc.projectsListNoApps()
      .then(this._filterReusable)
      .then(result => {
        reusable = result;

        if (!reusable) {
          return false;
        }

        return this._findRunningCloudApp(reusable);
      })
      .then(projectWithRunningCloudApp => {
        if (projectWithRunningCloudApp) {
          this._storeDetails(projectWithRunningCloudApp);

          return true;
        }

        this._storeDetails(reusable[0]);

        return this._deployCloudApp()
          .then(() => true);
      });
  }

  _filterReusable() {
    return fhc.projectsListNoApps()
      .then(projects => {
        const suitableProjects = projects.filter(project => {
          const templateMatch = project.jsonTemplateId === this.projectTemplateId;
          const prefixMatch = project.title.startsWith(config.prefix);
          return templateMatch && prefixMatch;
        });

        return async.sequence(
          suitableProjects,
          project => fhc.projectRead(project.guid)
            .then(projectDetails => {
              project.apps = projectDetails.apps;
            })
        ).then(() => suitableProjects.filter(project =>
          project.apps.find(app =>
            app.title === this.clientApp.name
          )
        ));
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

module.exports = ProjectPreparer;
