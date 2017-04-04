"use strict";
//TODO: ADD PLATFORM ARGUMENT

const config = require('../config/common.json');
const request = require('request');

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

function enablePush(appObj, pushCred, variantName) {
  console.log('Enabling new push server');

  var boundary = '----fhTemplateArtBoundary';

  var headers = {
    'Origin': `${config.host}`,
    'x-feedhenry-appguid': `${appObj.details.guid}`,
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Accept': 'application/json, text/plain, */*',
    'Connection': 'keep-alive',
    'Cookie': `feedhenry_v=3; feedhenry=${config.loginTokens.fhToken}; csrf=${config.loginTokens.csrf}; i18next=en`
  };

  var dataString = `--${boundary}\r\n`+
    `Content-Disposition: form-data; name="pushApplicationName"\r\n\r\n`+
    `${appObj.details.title}\r\n`+
    `--${boundary}\r\n`+
    `Content-Disposition: form-data; name="androidGoogleKey"\r\n\r\n`+
    `${pushCred.serverKey}\r\n`+
    `--${boundary}\r\n`+
    `Content-Disposition: form-data; name="androidProjectNumber"\r\n\r\n`+
    `${pushCred.senderId}\r\n`+
    `--${boundary}\r\n`+
    `Content-Disposition: form-data; name="androidVariantName"\r\n\r\n`+
    `${variantName}\r\n`+
    `--${boundary}--\r\n`;

  var options = {
    url: `${config.host}/api/v2/ag-push/rest/applications/bootstrap`,
    method: 'POST',
    headers: headers,
    body: dataString
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

function sendNotification(appObj, pushCred, message) {

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
      'user': pushCred.pushApp.id,
      'pass': pushCred.pushApp.secret
    }
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

function startPush(appObj, pushCred, variantName) {
  console.log('Preparing push server');

  return pushInit(appObj)
    .then(pushAppId => pushReadVariants(appObj, pushAppId),
          err => {
            if (err === '204: No Content') {
              return enablePush(appObj,pushCred,variantName);
            }
            throw new Error(`Error is occured while enabling new push server - "${err}"`);
          })
          .then(pushAppInfo => {
            pushCred.pushApp = {
              id: pushAppInfo.pushApplicationID,
              secret: pushAppInfo.masterSecret
            };
          },
          err => {
            throw new Error(`Error is oocured while preparing UPS - "${err}"`);
          });
}



module.exports = {
  startPush: startPush,
  sendNotification: sendNotification
};