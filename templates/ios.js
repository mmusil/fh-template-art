"use strict";

const IOSWelcomeSwiftTemplate = require('../model/template-ios-welcome-swift');

const templates = [
  // new IOSWelcomeSwiftTemplate('debug'),
  new IOSWelcomeSwiftTemplate('distribution')
];

module.exports = templates;
