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
    udid: '11797003d0ab2b74430af7f38fbf1b0f5b2a723d'
  },
  android: {
    browserName: '',
    'appium-version': '1.6',
    platformName: 'Android',
    platformVersion: '7.0',
    deviceName: 'Android Emulator',
  }
};

module.exports = config;
