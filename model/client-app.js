"use strict";

const fhc = require('../utils/fhc');
const config = require('../config/config');
const wd = require('wd');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
const appiumConfig = require('../config/appium');

class ClientApp {

  constructor(projectTemplateId, clientAppName, buildPlatform, test) {
    this.projectTemplateId = projectTemplateId;
    this.clientAppName = clientAppName;
    this.buildPlatform = buildPlatform;
    this.test = test;

    this.projCreateTries = 0;
    this.cloudDeployTries = 0;

    this.initAppium = this.initAppium.bind(this);
    this.finishAppium = this.finishAppium.bind(this);
    this.prepareCredBundle = this.prepareCredBundle.bind(this);
    this.findSuitableCredBundle = this.findSuitableCredBundle.bind(this);
    this.prepareEnvironment = this.prepareEnvironment.bind(this);
    this.prepareConnection = this.prepareConnection.bind(this);
    this.findSuitableProjects = this.findSuitableProjects.bind(this);
    this.findProjectWithRunningCloudApp = this.findProjectWithRunningCloudApp.bind(this);
    this.prepareProject = this.prepareProject.bind(this);
    this.createProject = this.createProject.bind(this);
    this.deployCloudApp = this.deployCloudApp.bind(this);
  }

  initAppium() {
    this.driver = wd.promiseChainRemote(appiumConfig.server);
    appiumConfig[this.buildPlatform].app = this.buildFile;
    return this.driver.init(appiumConfig[this.buildPlatform]);
  }

  finishAppium() {
    return this.driver.guit();
  }

  prepareCredBundle() {
    return this.findSuitableCredBundle()
      .then(credBundle => {
        if (!credBundle) {
          return this.createCredBundle();
        }
        this.credBundle = credBundle;
      });
  }

  findSuitableCredBundle() {
    return fhc.credentialsList()
      .then(credentials => (
        credentials.find(cred => (
          cred.bundleName.startsWith(config.prefix) &&
          cred.platform === this.buildPlatform &&
          cred.bundleType === this.buildType
        ))
      ));
  }

  prepareEnvironment() {
    return this.prepareProject()
      .then(this.prepareConnection);
  }

  prepareConnection() {
    return fhc.connectionsList(this.project.guid)
      .then(connections => (
        connections.find(connection => (
          connection.clientApp === this.clientApp.guid &&
          connection.environment === this.environment
        ))
      ))
      .then(connection => (
        fhc.connectionUpdate(
          this.project.guid,
          connection.guid,
          this.cloudApp.guid,
          this.environment
        )
      ))
      .then(connection => {
        this.connection = connection;
      });
  }

  findSuitableProjects() {
    return fhc.projectsListNoApps()
      .then(projects => {
        const suitableProjects = projects.filter(project => {
          const templateMatch = project.jsonTemplateId === this.projectTemplateId;
          const prefixMatch = project.title.startsWith(config.prefix);
          return templateMatch && prefixMatch;
        });

        return suitableProjects.reduce((p, proj) => (
          p.then(() => (fhc.projectRead(proj.guid).then(full => {
            proj.apps = full.apps;
          })))
        ), Promise.resolve()).then(() => (suitableProjects));
      });
  }

  findProjectWithRunningCloudApp(projects) {
    return projects.find(project => {
      const cloudApp = project.apps.find(app => (app.type === 'cloud_nodejs'));
      for (const env in cloudApp.runtime) {
        if (cloudApp.runtime[env]) {
          this.environment = env;
        }
      }
      return this.environment;
    });
  }

  prepareProject() {
    return this.findSuitableProjects()
      .then(projects => {
        if (projects.length === 0) {
          this.environment = config.environment;
          return this.createProject();
        }
        const runningProj = this.findProjectWithRunningCloudApp(projects);
        if (!runningProj) {
          this.environment = config.environment;
          this.project = projects[0];
          return this.deployCloudApp();
        }
        this.cloudApp = runningProj.apps.find(app => (app.type === 'cloud_nodejs'));
        this.project = runningProj;
      })
      .then(() => {
        this.clientApp = this.project.apps.find(app => (app.title === this.clientAppName));
      });
  }

  createProject() {
    if (this.projCreateTries >= config.retries) {
      throw new Error('Can not create project');
    }
    this.projCreateTries += 1;
    const projectName = config.prefix + new Date().getTime();
    return fhc.projectCreate(projectName, this.projectTemplateId)
      .then(project => {
        this.project = project;
      })
      .catch(console.error)
      .then(() => {
        if (!this.project) {
          return this.createProject();
        }
      })
      .then(this.deployCloudApp);
  }

  deployCloudApp() {
    if (this.cloudDeployTries >= config.retries) {
      throw new Error('Can not deploy cloud app');
    }
    this.cloudDeployTries += 1;
    this.cloudApp = this.project.apps.find(app => (app.type === 'cloud_nodejs'));
    return fhc.appDeploy(this.cloudApp.guid, this.environment)
      .then(() => {
        this.cloudDeployed = true;
      })
      .catch(console.error)
      .then(() => {
        if (!this.cloudDeployed) {
          return this.deployCloudApp();
        }
      });
  }

}

module.exports = ClientApp;
