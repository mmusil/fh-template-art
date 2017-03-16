"use strict";

const fhc = require('../utils/fhc');
const config = require('../config/config');
const unzip = require('../utils/unzip');
const path = require('path');
const fs = require('fs');
const rimraf = require('../utils/rimraf');

class Template {

  constructor(projectTemplateId, clientAppName, buildPlatform, buildType) {
    this.projectTemplateId = projectTemplateId;
    this.clientAppName = clientAppName;
    this.buildPlatform = buildPlatform;
    this.buildType = buildType;

    this.projCreateTries = 0;
    this.cloudDeployTries = 0;

    this.prepare = this.prepare.bind(this);
    this.findClientApp = this.findClientApp.bind(this);
    this.prepareProject = this.prepareProject.bind(this);
    this.createProject = this.createProject.bind(this);
    this.deployCloudApp = this.deployCloudApp.bind(this);
    this.prepareCredBundle = this.prepareCredBundle.bind(this);
    this.createCredBundle = this.createCredBundle.bind(this);
    this.buildClientApp = this.buildClientApp.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }

  prepare() {
    return fhc.init(config.host, config.username, config.password)
      .then(fhc.projectsListNoApps)
      .then(this.prepareProject)
      .then(this.findClientApp)
      .then(this.prepareCredBundle)
      .then(this.buildClientApp);
  }

  findClientApp() {
    this.clientApp = this.project.apps.find(app => (app.title === this.clientAppName));
  }

  prepareProject(projects) {
    const matchingProjects = projects.filter(project => {
      const templateMatch = project.jsonTemplateId === this.projectTemplateId;
      const prefixMatch = project.title.startsWith(config.prefix);
      return templateMatch && prefixMatch;
    });
    if (matchingProjects.length === 0) {
      this.environment = config.environment;
      return this.createProject()
        .then(this.deployCloudApp);
    }
    return matchingProjects.reduce((p, proj) => (
      p.then(() => (fhc.projectRead(proj.guid).then(full => {
        proj.apps = full.apps;
      })))
    ), Promise.resolve())
      .then(() => {
        const runningProj = matchingProjects.find(project => {
          const cloudApp = project.apps.find(app => (app.type === 'cloud_nodejs'));
          for (const env in cloudApp.runtime) {
            if (cloudApp.runtime.hasOwnProperty(env) && cloudApp.runtime[env]) {
              this.environment = env;
            }
          }
          return this.environment;
        });
        if (!runningProj) {
          this.environment = config.environment;
          this.project = matchingProjects[0];
          return this.deployCloudApp();
        }
        this.cloudApp = runningProj.apps.find(app => (app.type === 'cloud_nodejs'));
        this.project = runningProj;
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
      });
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

  prepareCredBundle() {
    if (this.buildPlatform === 'android' && this.buildType === 'debug') {
      return;
    }
    return fhc.credentialsList()
      .then(credentials => {
        this.credBundle = credentials.find(cred => (
          cred.bundleName.startsWith(config.prefix) &&
          cred.platform === this.buildPlatform &&
          cred.bundleType === this.buildType
        ));
        if (!this.credBundle) {
          return this.createCredBundle();
        }
      });
  }

  createCredBundle() {
    throw new Error('createCredBundle not implemented yet');
  }

  buildClientApp() {
    const tempFolder = path.resolve(__dirname, '../temp');
    let buildPromise;
    if (this.buildPlatform === 'ios') {
      buildPromise = fhc.build(
        this.project.guid,
        this.clientApp.guid,
        this.cloudApp.guid,
        this.environment,
        this.buildPlatform,
        this.buildType,
        config.iOS.keyPassword,
        config.iOS.certPassword,
        'true',
        this.credBundle.id,
        '0.0.1'
      );
    } else {
      buildPromise = Promise.reject('only ios build so far');
    }
    return buildPromise
      .then(build => {
        this.build = build;
        this.buildZip = path.resolve(__dirname, '..', build[1].download.file);
      })
      .then(() => (rimraf(tempFolder)))
      .then(() => (fs.mkdirSync(tempFolder)))
      .then(() => (unzip(this.buildZip, tempFolder)))
      .then(() => {
        const appfile = fs.readdirSync(tempFolder)[0];
        const ext = path.extname(appfile);
        const buildId = new Date().getTime();
        this.buildFile = path.resolve(__dirname, `../builds/${buildId}${ext}`);
        fs.unlinkSync(this.buildZip);
        fs.renameSync(path.resolve(tempFolder, appfile), this.buildFile);
      });
  }

  cleanup() {
    return Promise.resolve();
  }

}

module.exports = Template;
