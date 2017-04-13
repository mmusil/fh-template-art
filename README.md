# Client Apps Acceptance & Regression Tests

This tool helps you automate E2E testing of client apps. Appium is used to test mobile applications.

For every client app it tests it will:
* try to find suitable project (one with name starting with prefix specified in config/common.json and with template_id matching client app), if such a project does not exist it will try to create it
* try to find running cloud app in the project, if it is not running it will try to deploy it
* prepares connection between cloud and client app
* prepares credentials bundle if needed (again the tool tries to find suitable one before it attempts to create new one)
* for push starter apps:
  * changeBundleId of the app to one specified in config/credentials.json (iOS specific)
  * enables push for the app
* for SAML apps:
  * prepares SAML service in studio
  * associates the service with the project
  * sets all env variables needed
  * configures SAML server so that it accepts newly created service as SP
* build the application
* run tests

## Prerequisites

* [nvm](https://github.com/creationix/nvm) - fhc requires node version: >=0.10 <= 4.4, Appium requires node version >=6
* [Java](https://www.java.com/en/)
* [JDK](http://www.oracle.com/technetwork/java/javase/downloads/index-jsp-138363.html)
* [Appium](http://appium.io/)
  * make sure to install it in an environment with node version >=6
  * `npm install -g appium`

For Android:
* [Android Studio](https://developer.android.com/studio/index.html)
* set the ANDROID_HOME environment variable to point to your Android SDK path
* to be able to run on simulator:
  * list available devices with `emulator -list-avds`
  * run simulator with `emulator -avd avd_name`

For iOS:
* Mac
* Xcode and Xcode Command Line Developer Tools
* iOS physical device connected to your computer
* Apple developer account
  * your developer certificate installed in keychain
  * sign in to Xcode with your Apple ID
  * wildcard provisioning profile installed in Xcode
* [Homebrew](https://brew.sh/)
* `npm install -g ios-deploy`
* `brew install carthage`
* `brew install libimobiledevice --HEAD`

## Installation and configuration

* clone this repo
* `npm install`
  * make sure to install it in an environment with node version >=0.10 <= 4.4
* configure `config/common.json` to target RHMAP you want to test against
  * `npm run setup common -- -t <host> -u <user> -p <password> -e <environment> -f app-art-<your_name>-`

For Android:
* configure `config/appium.js`
  * set `android.platformVersion` to the version of Android on device you want to test with

For iOS:
* configure `config/appium.js`
  * set `ios.udid` to the udid of iOS device connected to your computer (you can find it with `instruments -s devices`)
  * set `ios.xcodeOrgId` to your Apple TeamID
* copy your key, certificate and debug provisioning profile (you can use [those](https://github.com/fheng/help/blob/master/developer_guides/clientsdk/7.buildfarm_ios_certificates.md#ios-wildcard-certificates-for-debug)) into `fixtures/ios` folder
* configure `config/credentials.json`
  * set fields under `ios` to point to the files you just copied and set password for your private key file
* after every test for iOS app, tool tries to connect to build farm and deletes the build from it, for this to work:
  * connect to iOS digger and add your public key to authorized keys
  * copy your private key to `fixtures`
  * configure `config/buildfarm.json`

For push testing:
* iOS:
  * copy your push key, certificate, debug provisioning profile and p12 for enabling UPS into `fixtures/ios/push` folder
  * configure `config/credentials.json`
    * set fields under `ios.push` to point to the files you just copied and set password for your private key file

For SAML testing:
* [running SAML service](https://github.com/fheng/help/blob/master/developer_guides/clientsdk/5.clientsdk_templates.md)
* [oc tool](https://docs.openshift.com/enterprise/3.1/cli_reference/get_started_cli.html)
* correct values in `config/saml.json`

## Running the tests

* start appium in separate console (with node version >=6)
* `npm start` (with node version >=0.10 <= 4.4)

### Running specific tests

To specify which client apps to test, use `npm run setup test -- -l <android|ios|all> -t <native|cordova|light|all> -m <welcome|helloworld|push|saml|sync|all> -i <objc|swift|all>` before `npm start`.

## Troubleshooting

### Error during "before" phase

As creation of projects and deployment of apps using fh-fhc is not very stable, it can fail. Tool tries to reuse existing projects. If it won't find any it will try to create it. With retries option in config/common.json you can specify how many times it should try to create project / deploy app. Another option is to create the projects (and deploy cloud apps) manually in studio. Just give it a name with prefix you've set in config/common.json.
