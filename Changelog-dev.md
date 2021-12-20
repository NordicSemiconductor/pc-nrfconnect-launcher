# Developer Changelog
All notable changes to this project which affect app developers will be
documented in this file. The changes which also affect end users are documented
in [Changelog.md](./Changelog.md).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## 3.9.2 - Unreleased
### Changed
- Updated nrf-device-lib-js to 0.4.1.
- Updated pc-nrfconnect-shared to 5.12.1.

## 3.9.1 - 2021-11-25
### Changed
- Updated nrf-device-lib-js to 0.3.20.
- Updated pc-nrfconnect-shared to 5.8.1.

## 3.9.0 - 2021-11-08
### Changed
- Updated nrf-device-lib-js to 0.3.18.
- Updated pc-nrfconnect-shared to 5.7.0.

## 3.8.0 - 2021-11-01
### Changed
- Replaced usage of pc-nrfjprog-js by nrf-device-lib-js.
- Updated pc-nrfconnect-shared to 4.6.2
- Updated Electron to 13.5.1
- Updated USB drivers
- Updated pc-ble-driver
### Deprecated
- Support for apps using the legacy architecture. Support will be removed in
  the next version, so they need to be upgraded until then:
  https://nordicsemiconductor.github.io/pc-nrfconnect-docs/migrating_apps
### Removed
- nrf-device-lister-js
- nrf-device-setup-js
- pc-nrf-dfu-js
- pc-nrfjprog-js

## 3.7.0 - 2021-06-23
### Changed
- Updated to pc-nrfconnect-shared 4.27.3.

## 3.6.0 - 2020-10-15
### Fixed
- Added workaround to prevent errors when proxy authentication is required.
- Error message was object instead of string.
- Client id generation on Linux.
- Added temporary fix to hide electron dialog api change for apps not yet
  requiring 3.6+ engine.

## 3.5.0 - 2020-09-02
### Added
- Portable executable for Windows.

## 3.4.0 - 2020-06-08
### Added
- Enabled use of Redux DevTools and ease installation of React and Redux
  DevTools.
### Removed
- Dependency of react-infinite.
### Changed
- This project was renamed to pc-nrfconnect-launcher.
- Fewer requests for entering proxy credentials when needed.
- Updated additional app architecture with new design.
