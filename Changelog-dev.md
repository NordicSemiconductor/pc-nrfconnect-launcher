# Developer Changelog
All notable changes to this project which affect app developers will be
documented in this file. The changes which also affect end users are documented
in [Changelog.md](./Changelog.md).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## 3.10.0
Dependency updates as found in [package.json](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/v3.10.0/package.json).

## 3.9.3
Dependency updates as found in [package.json](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/v3.9.3/package.json).

## 3.9.2
Dependency updates as found in [package.json](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/v3.9.2/package.json).

## 3.9.1
Dependency updates as found in [package.json](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/v3.9.1/package.json).

## 3.9.0
Dependency updates as found in [package.json](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/v3.9.0/package.json).

## 3.8.0
Dependency updates as found in [package.json](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/v3.8.0/package.json) and also:
### Changed
- Replaced usage of pc-nrfjprog-js by nrf-device-lib-js.
- Updated Electron to 13
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

## 3.7.2
Dependency updates as found in [package.json](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/v3.7.2/package.json).

## 3.7.1
Dependency updates as found in [package.json](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/v3.7.1/package.json).

## 3.7.0
Dependency updates as found in [package.json](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/v3.7.0/package.json).

## 3.6.1
Dependency updates as found in [package.json](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/v3.6.1/package.json).

## 3.6.0
Dependency updates as found in [package.json](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/v3.6.0/package.json) and also:
### Fixed
- Added workaround to prevent errors when proxy authentication is required.
- Error message was object instead of string.
- Client id generation on Linux.
- Added temporary fix to hide electron dialog api change for apps not yet
  requiring 3.6+ engine.

## 3.5.0
Dependency updates as found in [package.json](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/v3.5.0/package.json) and also:
### Added
- Portable executable for Windows.

## 3.4.0
Dependency updates as found in [package.json](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/v3.4.0/package.json) and also:
### Added
- Enabled use of Redux DevTools and ease installation of React and Redux
  DevTools.
### Removed
- Dependency of react-infinite.
### Changed
- This project was renamed to pc-nrfconnect-launcher.
- Fewer requests for entering proxy credentials when needed.
- Updated additional app architecture with new design.
