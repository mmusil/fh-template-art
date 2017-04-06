"use strict";

const config = require('../config/common.json');
const pushCred = require('../config/credentials.json');
const request = require('request');
const path = require('path');
const fs = require('fs');

function pushInit(appObj) {
  console.log('Checking for existing push server');

  var headers = {
    'x-feedhenry-appguid': `${appObj.details.guid}`,
    'Accept': 'application/json, text/plain, */*',
    'Referer': `${config.host}`,
    'Connection': 'keep-alive',
    'Cookie': `feedhenry_v=3; feedhenry=${config.loginTokens.fhToken}; csrf=${config.loginTokens.csrf}; i18next=en`
  };

  var options = {
    url: `${config.host}/api/v2/ag-push/init/${appObj.details.guid}`,
    headers: headers
  };

  return new Promise(function(resolve, reject) {
    request(options, function(err,res,body) {
      if (err || res.statusCode !== 200) {
        return reject(err ? err : `${res.statusCode}: ${res.statusMessage}`);
      }

      return resolve(JSON.parse(body).pushApplicationID);
    });
  });
}


function pushReadVariants(appObj, pushAppID) {
  var headers = {
    'x-feedhenry-appguid': `${appObj.details.guid}`,
    'Accept': 'application/json, text/plain, */*',
    'Referer': `${config.host}`,
    'Connection': 'keep-alive',
    'Cookie': `feedhenry_v=3; feedhenry=${config.loginTokens.fhToken}; csrf=${config.loginTokens.csrf}; i18next=en`
  };

  var options = {
    url: `${config.host}/api/v2/ag-push/rest/applications/${pushAppID}?includeActivity=true&includeDeviceCount=true`,
    headers: headers
  };

  return new Promise(function(resolve, reject) {
    request(options, function(err,res,body) {
      if (err || res.statusCode !== 200) {
        return reject(err ? err : `${res.statusCode}: ${res.statusMessage}`);
      }

      return resolve(JSON.parse(body));
    });
  });

}

function enablePush(appObj, variantName) {
  console.log('Enabling new push server');

  var platform = appObj.platform;
  var pushCredentials = pushCred[platform].push;
  var headers = {
    'x-feedhenry-appguid': `${appObj.details.guid}`,
    'Cookie': `feedhenry_v=3; feedhenry=${config.loginTokens.fhToken}; csrf=${config.loginTokens.csrf}`
  };
  var formData;
  if (platform === 'android') {
    formData = {
      pushApplicationName: appObj.details.title,
      androidGoogleKey: pushCredentials.serverKey,
      androidProjectNumber: pushCredentials.senderId,
      androidVariantName: variantName
    };
  } else {
    formData = {
      pushApplicationName: appObj.details.title,
      iosProduction: 'false',
      iosPassphrase: pushCredentials.password,
      iosVariantName: variantName,
      iosCertificate: fs.createReadStream(path.resolve(__dirname, `../${pushCredentials.p12}`))
    };
  }

  var options = {
    url: `${config.host}/api/v2/ag-push/rest/applications/bootstrap`,
    method: 'POST',
    headers: headers,
    formData: formData
  };

  return new Promise(function(resolve, reject) {
    request(options, function(err,res,body) {
      if (err || res.statusCode !== 200) {
        return reject(err ? err : `${res.statusCode}: ${res.statusMessage}`);
      }

      return resolve(JSON.parse(body));
    });
  });

}

function sendNotification(appObj, message) {

  var headers = {
    'Accept': 'application/json',
    'Content-type': 'application/json'
  };

  var dataString = {
    message: {
      alert: message,
      sound: "default"
    }
  };

  var options = {
    url: `${config.host}/api/v2/ag-push/rest/sender`,
    method: 'POST',
    headers: headers,
    body: JSON.stringify(dataString),
    auth: {
      'user': appObj.pushApp.id,
      'pass': appObj.pushApp.secret
    }
  };

  return new Promise(function(resolve, reject) {
    request(options, function(err,res,body) {
      if (err || res.statusCode !== 202) {
        return reject(err ? err : `${res.statusCode}: ${res.statusMessage}`);
      }

      return resolve(JSON.parse(body));
    });
  });

}

function startPush(appObj, variantName) {
  console.log('Preparing push server');

  return pushInit(appObj)
    .then(pushAppId => pushReadVariants(appObj, pushAppId),
          err => {
            if (err === '204: No Content') {
              return enablePush(appObj,variantName);
            }
            throw new Error(`Error is occured while enabling new push server - "${err}"`);
          })
          .then(pushAppInfo => ({
            id: pushAppInfo.pushApplicationID,
            secret: pushAppInfo.masterSecret
          }),
          err => {
            throw new Error(`Error is oocured while preparing UPS - "${err}"`);
          });
}



module.exports = {
  startPush: startPush,
  sendNotification: sendNotification
};
