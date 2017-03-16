"use strict";

const extract = require('extract-zip');
const path = require('path');

module.exports = function(zipFile, targetDir) {
  return new Promise((resolve, reject) => {
    extract(zipFile, {dir: targetDir}, error => {
      if (error) {
        return reject(error);
      }

      resolve();
    });
  });
};
