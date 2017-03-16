"use strict";

const extract = require('extract-zip');

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
