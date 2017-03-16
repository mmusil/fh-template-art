"use strict";

const AndroidWelcomeTemplate = require('../model/template-android-welcome');

const templates = [
  new AndroidWelcomeTemplate('debug')
  //new IOSWelcomeSwiftTemplate('distribution')
];

module.exports = templates;
