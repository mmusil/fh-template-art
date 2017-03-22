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
const studio = require('../utils/studio');
const path = require('path');
const rimraf = require('../utils/rimraf');
const fs = require('fs');
const exec = require('../utils/exec');

class ClientApp {

  constructor(projectTemplateId, clientAppName, buildPlatform, test, cordova) {
    this.projectTemplateId = projectTemplateId;
    this.name = clientAppName;
    this.buildPlatform = buildPlatform;
    this.test = test.bind(this);
    this.push = projectTemplateId === 'pushstarter_project';
    this.saml = projectTemplateId === 'saml_project';
    this.cordova = cordova;

    this.projCreateTries = 0;
    this.cloudDeployTries = 0;

    this.webviewContext = this.webviewContext.bind(this);
    this.initAppium = this.initAppium.bind(this);
    this.finishAppium = this.finishAppium.bind(this);
    this.prepareCredBundle = this.prepareCredBundle.bind(this);
    this.findSuitableCredBundle = this.findSuitableCredBundle.bind(this);
    this.prepareEnvironment = this.prepareEnvironment.bind(this);
    this.prepareSAML = this.prepareSAML.bind(this);
    this.prepareService = this.prepareService.bind(this);
    this.createService = this.createService.bind(this);
    this.deployService = this.deployService.bind(this);
    this.addSP = this.addSP.bind(this);
    this.sendPushNotification = this.sendPushNotification.bind(this);
    this.prepareConnection = this.prepareConnection.bind(this);
    this.findSuitableProjects = this.findSuitableProjects.bind(this);
    this.findProjectWithRunningCloudApp = this.findProjectWithRunningCloudApp.bind(this);
    this.prepareProject = this.prepareProject.bind(this);
    this.createProject = this.createProject.bind(this);
    this.deployCloudApp = this.deployCloudApp.bind(this);
  }

  webviewContext() {
    return this.driver.contexts().then(contexts => this.driver.context(contexts[1]));
  }

  initAppium() {
    this.driver = wd.promiseChainRemote(appiumConfig.server);
    appiumConfig[this.buildPlatform].app = this.buildFile;
    return this.driver.init(appiumConfig[this.buildPlatform])
      .then(() => {
        if (this.cordova) {
          return this.webviewContext();
        }
      });
  }

  finishAppium() {
    if (this.driver) {
      return this.driver.quit();
    }
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
      .then(credentials =>
        credentials.find(cred =>
          cred.bundleName.startsWith(config.prefix + (this.push ? 'push-' : 'normal-')) &&
          cred.platform === this.buildPlatform &&
          cred.bundleType === this.buildType
        )
      );
  }

  prepareEnvironment() {
    this.credConfig = this.push ? config[this.buildPlatform].push[this.buildType] : config[this.buildPlatform][this.buildType];

    return this.prepareProject()
      .then(this.prepareConnection)
      .then(() => {
        if (this.push) {
          return this.preparePush();
        }
      })
      .then(() => {
        if (this.saml) {
          return this.prepareSAML();
        }
      })
      .then(this.prepareCredBundle);
  }

  prepareSAML() {
    this.SAMLTempFolder = path.resolve(__dirname, '../tempSAML');
    return rimraf(this.SAMLTempFolder)
      .then(() => fhc.environmentRead(this.environment))
      .then(env => {
        this.environmentName = env.label;
      })
      .then(fhc.servicesList)
      .then(this.prepareService)
      .then(() => studio.associateService(this))
      .then(() => studio.associateSAML(this))
      .then(this.prepareSAMLPlatSpecific);
  }

  prepareService(services) {
    const matchingServices = services.filter(service => {
      const templateMatch = service.jsonTemplateId === 'saml-service';
      const prefixMatch = service.title.startsWith(config.prefix);
      return templateMatch && prefixMatch;
    });
    if (matchingServices.length === 0) {
      return this.createService()
        .then(this.deployService);
    }
    const runningServ = matchingServices.find(service => {
      const cloudApp = service.apps.find(app => app.type === 'cloud_nodejs');
      return cloudApp.runtime[this.environment];
    });
    if (!runningServ) {
      this.service = matchingServices[0];
      this.serviceId = this.service.apps.find(app => app.type === 'cloud_nodejs').guid;
      return this.deployService();
    }
    this.serviceId = runningServ.apps.find(app => app.type === 'cloud_nodejs').guid;
    this.service = runningServ;
    return fhc.ping(this.serviceId, this.environment)
      .then(running => {
        if (!running) {
          return this.deployService(true);
        }
      });
  }

  createService() {
    return fhc.serviceCreate(this.project.title, 'saml-service')
      .then(service => {
        this.service = service;
        this.serviceId = service.apps[0].guid;
      });
  }

  deployService(alreadySet) {
    return fhc.appDeploy(this.serviceId, this.environment)
      .then(() => {
        if (!alreadySet) {
          return studio.setSAMLVariables(this, config.saml)
          .then(() => studio.getSAMLExampleUrl(this))
          .then(() => studio.getSAMLIssuer(this))
          .then(this.addSP);
        }
      });
  }

  addSP() {
    fs.mkdirSync(this.SAMLTempFolder);
    return exec('oc project saml', this.SAMLTempFolder)
      .then(() => exec('oc get pods -o json', this.SAMLTempFolder))
      .then(pods => {
        this.samlPod = JSON.parse(pods.stdout).items[0].metadata.name;
      })
      .then(() => exec(`oc rsync ${this.samlPod}:/var/simplesamlphp/metadata/ .`, this.SAMLTempFolder))
      .then(() =>
        fs.appendFileSync(
          path.resolve(this.SAMLTempFolder, 'saml20-sp-remote.php'),
          `
          $metadata['${this.samlIssuer}'] = array(
            'AssertionConsumerService' => '${this.samlIssuer}',
          );`
        )
      )
      .then(() => exec(`oc rsync ./ ${this.samlPod}:/var/simplesamlphp/metadata`, this.SAMLTempFolder));
  }

  sendPushNotification() {
    return studio.sendPushNotification(this);
  }

  prepareConnection() {
    return fhc.connectionsList(this.project.guid)
      .then(connections => connections.find(connection =>
        connection.clientApp === this.clientApp.guid &&
        connection.status === 'ACTIVE'
      ))
      .then(connection =>
        fhc.connectionUpdate(
          this.project.guid,
          connection.guid,
          this.cloudApp.guid,
          this.environment
        )
      )
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

        return suitableProjects.reduce((p, proj) =>
          p.then(() => fhc.projectRead(proj.guid).then(full => {
            proj.apps = full.apps;
          })
        ), Promise.resolve()).then(() => suitableProjects);
      });
  }

  findProjectWithRunningCloudApp(projects) {
    return projects.find(project => {
      const cloudApp = project.apps.find(app => app.type === 'cloud_nodejs');
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
        this.cloudApp = runningProj.apps.find(app => app.type === 'cloud_nodejs');
        this.project = runningProj;
        return fhc.ping(this.cloudApp.guid, this.environment)
          .then(running => {
            if (!running) {
              return this.deployCloudApp();
            }
          });
      })
      .then(() => {
        this.clientApp = this.project.apps.find(app => app.title === this.clientAppName);
      });
  }

  createProject() {
    const projectName = config.prefix + new Date().getTime();
    if (this.projectTemplateId === 'hello_world_project') {
      return studio.createHelloWorldProject(projectName)
        .then(this.prepareProject);
    }
    if (this.projCreateTries >= config.retries) {
      throw new Error('Can not create project');
    }
    this.projCreateTries += 1;
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
    this.cloudApp = this.project.apps.find(app => app.type === 'cloud_nodejs');
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
