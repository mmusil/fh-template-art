"use strict";

const config = {
  server: {
    host: 'localhost',
    port: 4723
  },
  ios: {
    browserName: '',
    'appium-version': '1.6',
    platformName: 'iOS',
    platformVersion: '10.2',
    deviceName: 'iPhone 7',
    xcodeOrgId: '75B468G5L7',
    xcodeSigningId: 'iPhone Developer',
    fullReset: true,
    udid: '11311d2eda271918c3b43511d2cdb86a38206c37'
  },
  android: {
    browserName: '',
    'appium-version': '1.6',
    platformName: 'Android',
    platformVersion: '5.0',
    fullReset: true,
    deviceName: 'Android Emulator',
  }
};

module.exports = config;
