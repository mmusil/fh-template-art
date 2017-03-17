"use strict";

const AndroidClientApp = require('./model/client-app-android');
const IOSClientApp = require('./model/client-app-ios');

const clientApps = [
  // new AndroidClientApp('welcome_project', 'Welcome Project Android Gradle', require('./test/android/welcome')),
  new IOSClientApp('welcome_project', 'Welcome Project iOS (Swift)', require('./test/ios/welcome-swift'))
];

module.exports = clientApps;
