"use strict";

const AndroidClientApp = require('./model/client-app-android');
const IOSClientApp = require('./model/client-app-ios');

const clientApps = {
  android: {
    native: [
      new AndroidClientApp('hello_world_project', 'Helloworld Native Android Gradle App', require('./test/android/helloworld')),
      new AndroidClientApp('welcome_project', 'Welcome Project Android Gradle', require('./test/android/welcome')),
      new AndroidClientApp('pushstarter_project', 'Simple Android Push App', require('./test/android/pushstarter')),
      new AndroidClientApp('sync_project', 'Sync Android App', require('./test/android/sync')),
      new AndroidClientApp('saml_project', 'SAML Android', require('./test/android/saml'))
    ],
    cordova: [
      new AndroidClientApp('hello_world_project', 'Cordova App', require('./test/cordova/helloworld'), 'client_advanced_hybrid'),
      // new AndroidClientApp('welcome_project', 'Welcome Project-client', require('./test/cordova/welcome'), 'client_advanced_hybrid'),
      new AndroidClientApp('saml_project', 'SAML Client', require('./test/cordova/saml'), 'client_advanced_hybrid'),
      new AndroidClientApp('sync_project', 'Sync App', require('./test/cordova/sync'), 'client_advanced_hybrid')
    ],
    light: [
      new AndroidClientApp('welcome_project', 'Light', require('./test/cordova/welcome'), 'client_hybrid', 'https://github.com/feedhenry-templates/welcome-app', 'FH-v3.13.1')
    ]
  },
  ios: {
    native: [
      new IOSClientApp('hello_world_project', 'Native iOS (Swift) hello world app', require('./test/ios/helloworld')),
      new IOSClientApp('hello_world_project', 'Native iOS (Objective-C) hello world app', require('./test/ios/helloworld')),
      new IOSClientApp('welcome_project', 'Welcome Project iOS (Swift)', require('./test/ios/welcome')),
      new IOSClientApp('welcome_project', 'Welcome Project iOS (Objective-C)', require('./test/ios/welcome')),
      new IOSClientApp('pushstarter_project', 'Simple iOS (Swift) Push App', require('./test/ios/push'), 'native', 'PushStarter', 'org.aerogear.helloworldpush'),
      new IOSClientApp('pushstarter_project', 'Simple iOS (Objective-C) Push App', require('./test/ios/push'), 'native', 'PushStarter', 'org.aerogear.helloworldpush'),
      new IOSClientApp('saml_project', 'SAML iOS (Swift)', require('./test/ios/saml')),
      new IOSClientApp('saml_project', 'SAML iOS (Objective-C)', require('./test/ios/saml'), 'native', 'saml-ios-app'),
      new IOSClientApp('sync_project', 'Sync iOS (Swift) App', require('./test/ios/sync')),
      new IOSClientApp('sync_project', 'Sync iOS (Objective-C) App', require('./test/ios/sync'))
    ],
    cordova: [
      new IOSClientApp('hello_world_project', 'Cordova App', require('./test/cordova/helloworld'), 'client_advanced_hybrid'),
      new IOSClientApp('welcome_project', 'Welcome Project-client', require('./test/cordova/welcome'), 'client_advanced_hybrid'),
      new IOSClientApp('saml_project', 'SAML Client', require('./test/cordova/saml'), 'client_advanced_hybrid'),
      new IOSClientApp('sync_project', 'Sync App', require('./test/cordova/sync'), 'client_advanced_hybrid')
    ],
    light: [
      new IOSClientApp('welcome_project', 'Light', require('./test/cordova/welcome'), 'client_hybrid', null, null, 'https://github.com/feedhenry-templates/welcome-app', 'FH-v3.13.1')
    ]
  }
};

module.exports = clientApps;
