"use strict";

const AndroidClientApp = require('./model/client-app-android');
const IOSClientApp = require('./model/client-app-ios');

const clientApps = [
  new AndroidClientApp('welcome_project', 'Welcome Project Android Gradle', require('./test/android/welcome')),
  new IOSClientApp('hello_world_project', 'Native iOS (Swift) hello world app', require('./test/ios/helloworld')),
  new IOSClientApp('hello_world_project', 'Native iOS (Objective-C) hello world app', require('./test/ios/helloworld')),
  new IOSClientApp('welcome_project', 'Welcome Project iOS (Swift)', require('./test/ios/welcome')),
  new IOSClientApp('welcome_project', 'Welcome Project iOS (Objective-C)', require('./test/ios/welcome')),
  new IOSClientApp('pushstarter_project', 'Simple iOS (Swift) Push App', require('./test/ios/push-swift'), true, 'PushStarter', 'org.aerogear.helloworldpush')
];

module.exports = clientApps;
