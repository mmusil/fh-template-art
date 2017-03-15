"use strict";

const extract = require('extract-zip');
const path = require('path');

module.exports = function(zipFile) {
  return new Promise((resolve, reject) => {
    extract(zipFile, {dir: path.resolve(__dirname, '..')}, error => {
      if (error) {
        return reject(error);
      }

      resolve();
    });
  });
};
