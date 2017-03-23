"use strict";

const xml2js = require('xml2js');

function parse(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}

function build(js) {
  var builder = new xml2js.Builder();
  return builder.buildObject(js);
}

module.exports = {
  parse: parse,
  build: build
};
