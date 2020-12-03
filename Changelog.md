## Version 3.6.1
### Updates
- Small visual enhancements to apps using the new design
### Bugfixes
- After updating an app, the other apps showed no release notes anymore #502

## Version 3.6.0
### Updates
- Upgraded Electron to version 8
### Bugfixes
- Fixed app loader animation

## Version 3.5.0
### Features
- Updated design for new apps #458
- Added usage statistics #457
### Bugfixes
- Fixed JLink device enumeration issue

## Version 3.4.2
### Updates
- Updated pc-ble-driver-js to 2.7.2 #452
    See changes https://github.com/NordicSemiconductor/pc-ble-driver-js/releases/tag/v2.7.2
### Bugfixes
- Fixed that “Update all apps” sometimes showed an error message (even though it worked
  correctly). #451

## Version 3.4.1
### Updates
- Updated to pc-nrfjprog-js v1.7.3, including bundled nrfjprog v10.9.0 and JLink 6.80a

## Version 3.4.0
### Features
- Added app filter and button to update all apps #369
- Updated pc-ble-driver-js to 2.7.1 with SoftDevice 5 support #438
- Updated with fewer requests for entering proxy credentials when needed #370
- Enhanced error messages #403
    - Links in messages are clickable.
    - If an app source is removed from the server, users are assisted in removing it from client.
### Bugfixes
- Made retrieval of release notes more reliable, by not retrieving them from GitHub Releases anymore but our own server instead #388

## Version 3.3.3
### Updates
- Notarized macOS build. #419
- Updated to pc-nrfjprog-js v1.7.2, including bundled nrfjprog v10.8.0 and JLink 6.70d

## Version 3.3.1
### Features
- Added support for nRF52820
- Added support for modem UART DFU

### Updates
- Updated to pc-nrfjprog-js v1.7.0, including bundled nrfjprog v10.7.0 and JLink 6.62b

## Version 3.3.0
### Features
- Added support for nRF53 series, nRF52833, and MCUboot DFU
- Updated to pc-nrfjprog-js v1.6.0, including bundled nrfjprog v10.5.0 and JLink 6.54c #385
- Updated icon colors #373
### Bugfixes
- Fixed bug where app was opened in unreachable location #383

## Version 3.2.0
### Features
- Updated UI design of Launcher #326
- Updated logo and brand color #352
- Unified installation and launch of apps into the same page #326
- Added ability to show release notes for apps in launcher #351
- Shown release notes before updating #351
- Faster startup #350
- Apps get a read more link when the source provides a homepage URL #344
### Bugfixes
- Desktop shortcuts for apps from sources with names with white space are now generated correctly #358
- Text in log views is now selectable again #343

## Version 3.1.0
### Updates
- Updated to pc-ble-driver-js v2.6.1 with electron 5 support #324
- Updated to pc-nrfjprog-js v1.5.8, including bundled nrfjprog v10.3.0 and electron 5 support #324
- Updated log transports to winston 3 API #327
### Bugfixes
- Fixed shortcut generation on macOS #331 #332 #333  #334
- Fixed libusb errors and multiple event handlers #337
- Fixed winston multiple arguments #325
- Fixed multiple postinstall #325
- Fixed main layout scroll #340

## Version 3.0.0
### Updates
- Updated to React Bootstrap 4 #306
React Bootstrap is a fundamental dependency for nRF Connect for Desktop, used for UI components and layout. The update is a breaking change, requiring all apps to be updated.
There are no changes to nRF Connect features, except for some minor visual differences.
- Updated to pc-nrfjprog-js v1.5.4, including bundled nrfjprog v10.2.1 #319
### Bugfixes
- Fixed auto update issue #317
- Fixed nrfjprog library path issue for pc-nrfjprog-js #310 #311 #312
- Fixed shortcut generation on macOS #314

## Version 2.7.0
### Features
- Added support for pc-nrfjprog-js v1.5.1, including nrfjprog v10.1.1 with DFU programming #295 #296  #301
- Added system report generation #289
- Bundled nrfjprog libraries on Windows #296
- Added copy-to-clipboard to source URL and make it selectable #291
### Bugfixes
- Fixed proxy handling by ensuring sequential requests #302
- Fixed multiple loading of libusb issue #288

## Version 2.6.2
### Bugfix
- Updated pc-nrfjprog-js to version 1.4.4 that fixes logging related crash experienced with PPK app
- Updated related prebuilt modules

## Version 2.6.1
### Bugfixes
- Fixed multiple source updating issue  #272

## Version 2.6.0
### Features
- Added new way of distributing apps such as official, internal, etc, by introducing support for multiple app sources #256 #259
- Provided all precompiled​ dependencies. #263 #266  #267
- Updated pc-nrfjprog-js to version 1.4.1 along with nrfjprog v9.8.1 #263
- Updated info about bug reporting and added issue template file #265 #268
- Updated product page link URLs  #255
- Updated electron to 2.0.11 #261
- Supported displaying multiple serialports and board version of a device #262
- Removed 'Debug probe' item in device selector #264
### Bugfixes
- Fixed links in LogViewer to open urls in browser #258

## Version 2.5.0
### Features
- Updated pc-ble-driver-js to 2.4.2 #254
    See changes for v2.4.2 https://github.com/NordicSemiconductor/pc-ble-driver-js/releases
- Updated electron to 2.0 #252
- Updated jest to 23.4.1 #248 #249 #250
- Updated nrf-device-setup-js to 0.3.0 to support bootloader update #247
- Supported link in log messages #245
- Supported to relaunch app when encountering libusb error #242
- Exposed start & stop watching device API #244  #246
### Bugfixes
- Fixed tests for breaking issue of jsdom #251

## Version 2.4.0
### Features
- Added support for nRF52840 dongle #204, #219, #220
- Updated pc-ble-driver-js to 2.4.1 #214
    See changes for v2.4.0 and v2.4.1 https://github.com/NordicSemiconductor/pc-ble-driver-js/releases
- Added support for generic (jprog/dfu) device setup by nrf-device-setup module
- Upgraded to Electron v1.8 #203
- Added API documentation of using the new DeviceSelector and device setup configuration
- Added troubleshooting documentation related to USB issues #208, #212, #223

## Version 2.3.2
### Bugfixes
- Used developer.nordicsemi.com as registry for apps (0c6a405)

## Version 2.3.1
### Bugfixes
- Fixed issue with apps failing to install (#206)

## Version 2.3.0-alpha.6
Pre-release with Linux AppImage.

## Version 2.3.0
### Features
- Added AppImage release artifact for Linux with support for automatic updates (#156)
- Added the [usb module](https://www.npmjs.com/package/usb) from npm, so that apps can import it (#157)
- New opt-in device selector with support for libusb devices (experimental) (#157)
- Added logging of meta information when loading apps (#154)
- Showing link to release notes in auto update dialog (#148, #163)
- Allowing user to overwrite old app when adding a new local app that already exists (#143)
- Using separate log and data directories for apps (#139)
- Upgraded to pc-nrfjprog-js v1.2.0 (https://github.com/NordicSemiconductor/pc-nrfjprog-js/releases/tag/v1.2.0)
- Upgraded to pc-ble-driver-js v2.3.0 (https://github.com/NordicSemiconductor/pc-ble-driver-js/releases/tag/v2.3.0)
### Bugfixes
- Improved icon resolution for app shortcuts (#152)
- Improved icon resolution on macOS (#147)
- Improved handling of edge cases in J-Link serial number lookup (#145, #146)
- Fixed issue with side panel not visible on narrow screens (#141)
- Verifying that serial port is not dead when selected (#137)

## Version 2.3.0-alpha.3
Pre-release which improves serial number lookup on Windows (#146).

## Version 2.3.0-alpha.2
Pre-release with handling of edge cases in J-Link serial number lookup (#145).

## Version 2.2.1
### Bugfixes
- Improve JLink serial number lookup time on Windows (#135)
- pc-ble-driver-js: Increase retransmission interval to give the peer more time to repond (https://github.com/NordicSemiconductor/pc-ble-driver-js/pull/99)
- pc-ble-driver-js: Emit debug message instead of error for unsupported devkits (https://github.com/NordicSemiconductor/pc-ble-driver-js/pull/95)

## Version 2.2.0
### Features
- Allow creating desktop shortcuts for installed apps (#118, #120, #124)
- Upgrade to pc-nrfjprog-js v1.1.0 and nRF5x-Command-Line-Tools v9.7.1 (#134)
- Upgrade to pc-ble-driver-js v2.1.0 (https://github.com/NordicSemiconductor/pc-ble-driver-js/releases/tag/v2.1.0)
### Bugfixes
- Fix issue with JLink library not found when installed in custom location on Linux/macOS (fixed by command line tools v9.7.1)

## Version 2.1.0
### Features
- Improved support for proxy servers (#104, #107, #113)
- New settings screen that allows turning off checking for updates at startup (#104)
- Make it easier for users to install apps manually (#105, #111)
- Allow apps to filter ports in the serial port selector (#106)
### Fixes
- Disable navigation when items are dragged and dropped into the application (#110)
### Installation
Downloads are available for Windows (exe), macOS (dmg), and Linux (tar.gz).

## Version 2.1.0-alpha.0
Pre-release with improved support for proxies, ref. #104.

## Version 2.0.0
While nRF Connect v1 was a dedicated Bluetooth low energy tool, v2 is a framework that can launch multiple desktop apps. The Bluetooth low energy tool has been [rewritten as an app](https://github.com/NordicSemiconductor/pc-nrfconnect-ble) for the nRF Connect framework, and can be installed and launched through the nRF Connect UI.
### Features
- Allows users to easily install, update, and launch apps
- Allows developers to [create new apps](https://nordicsemiconductor.github.io/pc-nrfconnect-docs/create_new_app)
- Supports Windows, macOS, and Linux
- Automatic updates for Windows and macOS
### Installation
Downloads are available for Windows (exe), macOS (dmg), and Linux (tar.gz).

## Version 2.0.0-alpha.15
Alpha release for testing.
