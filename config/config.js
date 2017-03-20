"use strict";

module.exports = {
  host: '',
  username: '',
  password: '',
  prefix: 'app-art-',
  retries: 3,
  environment: '',
  cleanup: false,
  buildType: {
    android: 'debug',
    ios: 'debug'
  },
  android: {
    debug: {}
  },
  ios: {
    debug: {
      key: 'fixtures/ios/debug/RHDevelopment.p12',
      cer: 'fixtures/ios/debug/RHDevelopment.cer',
      provision: 'fixtures/ios/debug/RHDevelopmentWildcard.mobileprovision',
      keyPassword: '',
      certPassword: ''
    },
    distribution: {
      key: 'fixtures/ios/distribution/rht_inhouse_pk.p12',
      cer: 'fixtures/ios/distribution/rht_inhouse_cert.cer',
      provision: 'fixtures/ios/distribution/RHTINHOUSE_09122017.mobileprovision',
      keyPassword: '',
      certPassword: ''
    },
    push: {
      debug: {
        bundleId: '',
        key: 'fixtures/ios/push/debug/Certificates.p12',
        p12: 'fixtures/ios/push/debug/fastlane.p12',
        cer: 'fixtures/ios/push/debug/ios_development.cer',
        provision: 'fixtures/ios/push/debug/fastlane.mobileprovision',
        keyPassword: '',
        certPassword: '',
        p12Password: ''
      }
    }
  },
  saml: {
    host: '',
    username:'',
    password: '',
    entryPoint: '',
    authContext: '',
    cert: ''
  }
};
