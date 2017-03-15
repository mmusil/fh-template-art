"use strict";

const fhc = require('../utils/fhc');
const templates = require('../templates/ios');
const config = require('../config/config');

const wd = require('wd');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const should = chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
const path = require('path');
const _ = require('underscore');

const serverConfig = {
  host: 'localhost',
  port: 4723
};

const driverConfig = {
  browserName: '',
  'appium-version': '1.6',
  platformName: 'iOS',
  platformVersion: '10.2',
  deviceName: 'iPhone 7',
  udid: '11797003d0ab2b74430af7f38fbf1b0f5b2a723d',
  app: undefined,
  xcodeOrgId: '75B468G5L7',
  xcodeSigningId: 'iPhone Developer'
};

const projectTemplateId = 'welcome_project';
const clientAppName = 'Welcome Project iOS (Swift)';

let environment;
let project;
let cloudApp;
let clientApp;
let build;
let projCreateTries = 0;
let cloudDeployTries = 0;
let cloudDeployed;

function prepareProject(projects) {
  const matchingProjects = projects.filter(proj => {
    const templateMatch = proj.jsonTemplateId === projectTemplateId;
    const prefixMatch = proj.title.startsWith(config.prefix);
    return templateMatch && prefixMatch;
  });
  if (matchingProjects.length === 0) {
    environment = config.environment;
    return createProject()
      .then(deployCloudApp);
  }
  return matchingProjects.reduce((p, proj) => (
    p.then(() => (fhc.projectRead(proj.guid).then(full => {
      proj.apps = full.apps;
    })))
  ), Promise.resolve())
    .then(() => {
      const runningProj = matchingProjects.find(proj => {
        const cloudApp = proj.apps.find(app => (app.type === 'cloud_nodejs'));
        for (const env in cloudApp.runtime) {
          if (cloudApp.runtime.hasOwnProperty(env) && cloudApp.runtime[env]) {
            environment = env;
          }
        }
        return environment;
      });
      if (!runningProj) {
        environment = config.environment;
        project = matchingProjects[0];
        return deployCloudApp();
      }
      cloudApp = runningProj.apps.find(app => (app.type === 'cloud_nodejs'));
      project = runningProj;
    });
}

function createProject() {
  if (projCreateTries >= config.retries) {
    throw new Error('Can not create project');
  }
  projCreateTries += 1;
  const projectName = config.prefix + new Date().getTime();
  return fhc.projectCreate(projectName, projectTemplateId)
    .then(proj => {
      project = proj;
    })
    .catch(console.error)
    .then(() => {
      if (!project) {
        return createProject();
      }
    });
}

function deployCloudApp() {
  if (cloudDeployTries >= config.retries) {
    throw new Error('Can not deploy cloud app');
  }
  cloudDeployTries += 1;
  cloudApp = project.apps.find(app => (app.type === 'cloud_nodejs'));
  return fhc.appDeploy(cloudApp.guid, environment)
    .then(() => {
      cloudDeployed = true;
    })
    .catch(console.error)
    .then(() => {
      if (!cloudDeployed) {
        return deployCloudApp();
      }
    });
}

function findClientApp() {
  clientApp = project.apps.find(app => (app.title === clientAppName));
}

function buildClientApp() {
  return fhc.build(project.guid, clientApp.guid, cloudApp.guid, environment, 'ios', 'distribution', 'redhat', 'redhat', 'true', 'dsiz4aerpj3y2k6m3qj7qi67', '0.0.1')
    .then(b => {
      console.log(b);
      build = b;
    });
}

describe('Test for iOS Helloworld', function() {

  this.timeout(15 * 60 * 1000);

  let driver;

  before(function() {
    // driver = wd.promiseChainRemote(serverConfig);
    //
    // var desired = _.clone(ios92);
    // desired.app = iosTestApp;
    return Promise.resolve()//driver.init(desired)
      .then(() => (fhc.init(config.host, config.username, config.password)))
      .then(fhc.projectsListNoApps)
      .then(prepareProject)
      .then(findClientApp)
      // .then(() => {
      //   console.log(project);
      // })
      .then(buildClientApp);
  });

  after(function() {
    // return template.cleanup();
  });

  it('should pass UI tests', function() {
    // return template.test();
  });

});
