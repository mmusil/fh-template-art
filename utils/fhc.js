"use strict";

const fh = require('fh-fhc');

function init(host, username, password) {
  var cfg = {
    loglevel: 'error',
    json: true,
    feedhenry: host,
    user: username,
    inmemoryconfig: true
  };

  return new Promise(function(resolve, reject) {
    fh.load(cfg, function(err) {
      if (err) {
        return reject(err);
      }
      fh.target({_:[host]}, function(err) {
        if (err) {
          return reject(err);
        }
        fh.login({_:[username, password]}, function(err,loginTokens) {
          if (err) {
            return reject(err);
          }

          return resolve({fhToken: loginTokens.login, csrf:loginTokens.csrf});
        });
      });
    });
  });
}

function appDeploy(appGuid, env) {
  return new Promise(function(resolve, reject) {
    fh.app.stage({app: appGuid, env: env, runtime: 'node4'}, function(error, startRes) {
      if (error) {
        return reject(error);
      }

      resolve(startRes);
    });
  });
}

function appImport(projectId, title, type, source, env) {
  return new Promise(function(resolve, reject) {
    fh.import({_: [projectId, title, type,
      source, '--env=' + env]}, function(error, importRes) {
      if (error) {
        return reject(error);
      }

      resolve(JSON.parse(importRes));
    });
  });
}

function connectionUpdate(projectId, connectionId, cloudAppId, env) {
  return new Promise(function(resolve, reject) {
    fh.connections({_: ['update', projectId, connectionId,
      cloudAppId, '--env=' + env]}, function(error, updateRes) {
      if (error) {
        return reject(error);
      }

      resolve(updateRes);
    });
  });
}

function connectionsList(projectId) {
  return new Promise(function(resolve, reject) {
    fh.connections({_: ['list', projectId]}, function(error, connections) {
      if (error) {
        return reject(error);
      }

      resolve(connections);
    });
  });
}

function policyCreate(policyId, policyType, configurations, checkUserExists, checkUserApproved) {
  return new Promise(function(resolve, reject) {
    fh['admin-policies']({_: ['create', policyId, policyType, configurations,
      checkUserExists, checkUserApproved]}, function(error, policy) {
      if (error) {
        return reject(error);
      }

      resolve(policy);
    });
  });
}

function policyDelete(guid) {
  return new Promise(function(resolve, reject) {
    fh['admin-policies']({_:['delete', guid]}, function(err) {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

function projectsList() {
  return new Promise((resolve, reject) => {
    fh.projects({_:['list']}, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}

function projectsListNoApps() {
  return new Promise((resolve, reject) => {
    fh.call({_:['/box/api/projects?apps=false']}, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}

function projectRead(guid) {
  return new Promise(function(resolve, reject) {
    try {
      fh.projects({_:['read', guid]}, function(err, result) {
        if (err) {
          return reject(err);
        }

        resolve(result);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function projectCreate(name, templateId) {
  return new Promise(function(resolve, reject) {
    fh.projects({_:['create', name, templateId]}, function(err, result) {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}

function projectDelete(guid) {
  return new Promise(function(resolve, reject) {
    fh.projects({_:['delete', guid]}, function(err) {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

function secureEndpoints(appGuid, security, env) {
  return new Promise(function(resolve, reject) {
    fh.secureendpoints({_: ['set-default', appGuid, security], env: env}, function(error, res) {
      if (error) {
        return reject(error);
      }

      resolve(res);
    });
  });
}

function environmentRead(id) {
  return new Promise(function(resolve, reject) {
    fh.admin.environments.read({id: id}, function(error, res) {
      if (error) {
        return reject(error);
      }

      resolve(res);
    });
  });
}

function serviceCreate(name, templateId) {
  return new Promise(function(resolve, reject) {
    fh.services({_:['create', name, templateId]}, function(error, res) {
      if (error) {
        return reject(error);
      }

      resolve(res);
    });
  });
}

function serviceDelete(guid) {
  return new Promise(function(resolve, reject) {
    fh.services({_:['delete', guid]}, function(error, res) {
      if (error) {
        return reject(error);
      }

      resolve(res);
    });
  });
}

function servicesList() {
  return new Promise(function(resolve, reject) {
    fh.services({_:['list']}, function(error, res) {
      if (error) {
        return reject(error);
      }

      resolve(res);
    });
  });
}

function buildIOS(projectId, clientAppId, cloudAppId, environment, destination, config, keypass, certpass, download, bundleId, tag) {
  return new Promise(function(resolve, reject) {
    fh.build({_: [
      `project=${projectId}`,
      `app=${clientAppId}`,
      `cloud_app=${cloudAppId}`,
      `environment=${environment}`,
      `destination=${destination}`,
      `config=${config}`,
      `keypass=${keypass}`,
      `certpass=${certpass}`,
      `download=${download}`,
      `bundleId=${bundleId}`,
      `tag=${tag}`
    ]}, function(error, res) {
      if (error) {
        return reject(error);
      }

      resolve(res);
    });
  });
}

function buildAndroidDebug(projectId, clientAppId, cloudAppId, environment, destination, config, download, tag) {
  return new Promise(function(resolve, reject) {
    fh.build({_: [
      `project=${projectId}`,
      `app=${clientAppId}`,
      `cloud_app=${cloudAppId}`,
      `environment=${environment}`,
      `destination=${destination}`,
      `config=${config}`,
      `download=${download}`,
      `tag=${tag}`
    ]}, function(error, res) {
      if (error) {
        return reject(error);
      }

      resolve(res);
    });
  });
}

function credentialsList() {
  return new Promise(function(resolve, reject) {
    fh.credentials({_:['list']}, function(error, res) {
      if (error) {
        return reject(error);
      }

      resolve(res);
    });
  });
}

function ping(appId, env) {
  return new Promise(function(resolve) {
    fh.ping({_:[appId, '--env=' + env]}, function(error) {
      if (error) {
        return resolve(false);
      }

      resolve(true);
    });
  });
}

function getUserKey(username) {
  return new Promise(function(resolve,reject) {
    var param={"_":['read',username]};
    fh.keys.user(param,function(err,key) {
      if (err) {
        console.log('Key is not found. Creating new key');
        param = {"_":['add',username]};
        fh.keys.user(param,function(err,key) {
          if (err) {
            return reject(err);
          }

          return resolve(key.apiKey);
        });
      }

      return resolve(key.key);

    });
  });
}

function getAppKey(projectId, cloudAppId) {
  return new Promise(function(resolve, reject) {
    fh.app.read({
      project: projectId,
      app: cloudAppId
    },
    function(err,appInfo) {
      if (err) {
        return reject(err);
      }
      return resolve(appInfo.apiKey);
    });
  });
}

function getCloudUrl(cloudAppId,environment) {
  return new Promise(function(resolve, reject) {
    fh.app.hosts({
      env: environment,
      app: cloudAppId
    },
    function(err,hosts) {
      if (err) {
        return reject(err);
      }
      return resolve(hosts.url);
    });
  });
}

function listEnvironmentVariables(appId, envId) {
  return new Promise(function(resolve, reject) {
    fh.call({_:[
      `box/api/apps/${appId}/env/${envId}/envvars`
    ]}, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}

function addEnvironmentVariable(appId, envId, varName, varValue) {
  return new Promise(function(resolve, reject) {
    fh.call({_:[
      `box/api/apps/${appId}/env/${envId}/envvars`,
      'POST',
      {
        name: varName,
        value: varValue
      }
    ]}, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}

function updateEnvironmentVariable(appId, envId, varName, varValue) {
  return listEnvironmentVariables(appId, envId)
    .then(vars => {
      const varDetails = vars.find(v => v.varName === varName);

      if (!varDetails) {
        return addEnvironmentVariable(appId, envId, varName, varValue);
      }

      return new Promise(function(resolve, reject) {
        fh.call({_:[
          `box/api/apps/${appId}/env/${envId}/envvars/${varDetails.guid}`,
          'PUT',
          {
            name: varName,
            value: varValue
          }
        ]}, (err, result) => {
          if (err) {
            return reject(err);
          }

          resolve(result);
        });
      });
    });
}

function pushEnvironmentVariables(appId, envId) {
  return new Promise(function(resolve, reject) {
    fh.call({_:[
      `box/api/apps/${appId}/env/${envId}/envvars/push`,
      'POST',
      {}
    ]}, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}

function associateService(projectId, serviceId) {
  return new Promise(function(resolve, reject) {
    fh.call({_:[
      `box/api/projects/${projectId}/connectors`,
      'PUT',
      [serviceId]
    ]}, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}

function gitPull(projectId, appId) {
  let requestId;
  let complete;

  return request()
    .then(waitForComplete);

  function waitForComplete() {
    return waitSec()
      .then(getStatus)
      .then(() => {
        if (!complete) {
          return waitForComplete();
        }
      });
  }

  function waitSec() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  function request() {
    return new Promise(function(resolve, reject) {
      fh.call({_:[
        `box/api/projects/${projectId}/apps/${appId}/pull`,
        'POST'
      ]}, (err, result) => {
        if (err) {
          return reject(err);
        }

        requestId = result.error.cacheKeys[0];

        resolve();
      });
    });
  }

  function getStatus() {
    return new Promise(function(resolve, reject) {
      fh.call({_:[
        `api/v2/logs/${requestId}`
      ]}, (err, result) => {
        if (err) {
          return reject(err);
        }

        complete = result.progress === 100;

        resolve();
      });
    });
  }
}

module.exports = {
  init: init,
  appDeploy: appDeploy,
  appImport: appImport,
  connectionUpdate: connectionUpdate,
  connectionsList: connectionsList,
  policyCreate: policyCreate,
  policyDelete: policyDelete,
  projectsList: projectsList,
  projectsListNoApps: projectsListNoApps,
  projectRead: projectRead,
  projectCreate: projectCreate,
  projectDelete: projectDelete,
  secureEndpoints: secureEndpoints,
  environmentRead: environmentRead,
  serviceCreate: serviceCreate,
  serviceDelete: serviceDelete,
  servicesList: servicesList,
  buildIOS: buildIOS,
  buildAndroidDebug: buildAndroidDebug,
  credentialsList: credentialsList,
  ping: ping,
  getUserKey: getUserKey,
  getAppKey: getAppKey,
  getCloudUrl: getCloudUrl,
  listEnvironmentVariables: listEnvironmentVariables,
  addEnvironmentVariable: addEnvironmentVariable,
  updateEnvironmentVariable: updateEnvironmentVariable,
  pushEnvironmentVariables: pushEnvironmentVariables,
  associateService: associateService,
  gitPull: gitPull
};
