# Client Apps Acceptance & Regression Tests

So far only iOS testing.

## iOS tests

iOS tests are written with XCTest. Testing of these apps is currently automated:
* Helloworld - Objective-C
* Helloworld - Swift
* Welcome app - Objective-C
* Welcome app - Swift
* PushStarter - Swift
* SAML - Swift

## Prerequisites

For iOS:
* Mac
* Xcode

For iOS push testing:
* Apple Developer Program account
* physical device connect to your Mac
* [fastlane tools](https://github.com/fastlane/fastlane)
* credentials added to [fastlane CredentialsManager](https://github.com/fastlane/fastlane/tree/master/credentials_manager)

For iOS SAML testing:
* [running SAML service](https://github.com/fheng/help/blob/master/developer_guides/clientsdk/5.clientsdk_templates.md)
* [oc tool](https://docs.openshift.com/enterprise/3.1/cli_reference/get_started_cli.html)
* you have to be logged in to the OpenShift where SAML service is running (using `oc login ...`)

## Running the tests

* `npm install`
* add correct values to config.js
* `npm start`

## Troubleshooting

### Error during "before" phase

As creation of projects and deployment of apps using fh-fhc is not very stable, it can fail. Tool tries to reuse existing projects. If it won't find any it will try to create it. With retries option in config.js you can specify how many times it should try to create project / deploy app. Another option is to create the projects (and deploy cloud apps) manually in studio. Just give it a name with prefix you've set in config.js.

### iOS push

If there is an error during "before" phase of push template testing, there is probably an issue with fastlane pem. Go to [provisioning portal](https://developer.apple.com/account/overview.action) and revoke Push certificates for AppID you specified in config.json.

If there is an issue during actual testing, reconnect your device.

## TODO

* rewrite iOS UI tests
  * wait for elements visible instead of sleep
  * proper name for test
  * decide what to do when fhconfig.plist is not populated with correct values
* marge iOS UI tests
* rest of iOS apps: Sync, Push Obj-C, SAML
* Android testing
* Cordova testing
