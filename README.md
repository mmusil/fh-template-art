# Client Apps Acceptance & Regression Tests

This tool helps you automate E2E testing of client apps. Appium is used to test mobile applications.

For every client app it tests it will:
* try to find suitable project (one with name starting with prefix specified in config.js and with template_id matching client app), if such a project does not exist it will try to create it (unfortunately creating projects with fh-fhc seems to be unstable and often fails)
* try to find running cloud app in the project, if it is not running it will try to deploy it
* prepares connection between cloud and client app
* prepares credentials bundle if needed (again the tool tries to find suitable one before it attempts to create new one)
* for push starter apps:
  * changeBundleId of the app to one specified in config.js (iOS specific)
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
* [Appium](http://appium.io/)
  * make sure to install it in an environment with node version >=6
  * [installation guide for Mac](http://appium.io/slate/en/master/?ruby#running-appium-on-mac-os-x)
  * [running Appium on real iOS devices](http://appium.io/slate/en/master/?ruby#appium-on-real-ios-devices)
  * [Cordova on real iOS devices](http://appium.io/slate/en/master/?ruby#execution-against-a-real-ios-device)
  * if you are still not able to run tests on real iOS devices, there can be problem with signing of WDA - open WDA project in Xcode and set your team
* make sure to run this tool with node version >=0.10 <= 4.4
* iOS and Android physical devices connected to your computer

For iOS:
* Mac
* Xcode
* certificates, keys, provisioning profiles in `fixtures` folder
* correct values in `config/credentials.json`

For iOS push testing:
* Apple Developer Program account

For SAML testing:
* [running SAML service](https://github.com/fheng/help/blob/master/developer_guides/clientsdk/5.clientsdk_templates.md)
* [oc tool](https://docs.openshift.com/enterprise/3.1/cli_reference/get_started_cli.html)
* correct values in `config/saml.json`

## Running the tests

* start appium in separate console
* `npm install`
* add correct values to `config/appium.js`
* configure `config/common.js`
  * `npm run setup common` or `npm run setup common -- -h` will show you help
  * **You need to add `--` to send arguments directly to the setup util** 
* `npm start`

### Running specific tests

To specify which client apps to test, use `npm run setup test` before `npm start`.

## Troubleshooting

### Error during "before" phase

As creation of projects and deployment of apps using fh-fhc is not very stable, it can fail. Tool tries to reuse existing projects. If it won't find any it will try to create it. With retries option in config.js you can specify how many times it should try to create project / deploy app. Another option is to create the projects (and deploy cloud apps) manually in studio. Just give it a name with prefix you've set in config.js.
