"use strict";

const request = require('request');

const headers = {
  'Content-Type': 'application/json',
  'Accept': '*/*',
  'Connection': 'keep-alive'
};

function getCollectionsList(appObj) {

  var dataString = `{"__fh":{"appkey":"${appObj.cloudApp.apiKey}","userkey":"${appObj.userKey}"},"act":"list"}`;

  var options = {
    url: `${appObj.cloudHost}/mbaas/db`,
    method: 'POST',
    headers: headers,
    body: dataString
  };


  return new Promise(function(resolve, reject) {
    request(options,
              function(err, res, body) {
                if (err || res.statusCode !== 200) {
                  return reject(err ? err: `${res.statusCode}: ${res.statusMessage}`);
                }
                body = JSON.parse(body);
                return resolve(body.list);
              }
      );
  });
}

function getItemsList(appObj, collectionName) {

  var dataString = `{"act":"list","type":"${collectionName}","__fh":{"appkey":"${appObj.cloudApp.apiKey}","userkey":"${appObj.userKey}"}}`;

  var options = {
    url: `${appObj.cloudHost}/mbaas/db`,
    method: 'POST',
    headers: headers,
    body: dataString
  };

  return new Promise(function(resolve, reject) {
    request(options,
                function(err,res,body) {
                  if (err || res.statusCode !== 200) {
                    return reject(err ? err: `${res.statusCode}: ${res.statusMessage}`);
                  }
                  body = JSON.parse(body);
                  return resolve(body.list);
                }
        );
  });

}

function getItemFromDb(appObj, collectionName, dbEntry) {

  var dataString = `{"act":"list","type":"${collectionName}","__fh":{"appkey":"${appObj.cloudApp.apiKey}","userkey":"${appObj.userKey}"}}`;

  var options = {
    url: `${appObj.cloudHost}/mbaas/db`,
    method: 'POST',
    headers: headers,
    body: dataString
  };

  return new Promise(function(resolve, reject) {
    request(options,
                function(err,res,body) {
                  if (err || res.statusCode !== 200) {
                    return reject(err ? err: `${res.statusCode}: ${res.statusMessage}`);
                  }
                  body = JSON.parse(body);
                  var item = body.list.find(dbItem => dbItem.fields[Object.keys(dbItem.fields)[0]] === dbEntry);
                  return resolve(item.fields[Object.keys(item.fields)[0]]);
                }
        );
  });

}

module.exports = {
  getCollectionsList: getCollectionsList,
  getItemsList: getItemsList,
  getItemFromDb: getItemFromDb
};
