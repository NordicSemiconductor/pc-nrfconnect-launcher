# Developer Changelog
All notable changes to this project which affect app developers will be
documented in this file. The changes which also affect end users are documented
in [Changelog.md](./Changelog.md).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## 3.7.0 - 2021-06-23
### Changed
- Updated to pc-nrfconnect-shared 4.27.3.

## 3.6.0 - 2020-10-15
### Fixed
- Added workaround to prevent errors when proxy authentication is required.
- Error message was object instead of string.
- Client id generation on Linux.
- Added temporary fix to hide electron dialog api change for apps not yet requiring 3.6+ engine.

## 3.5.0 - 2020-09-02
### Added
- Portable executable for Windows.

## 3.4.0 - 2020-06-08
### Added
- Enabled use of Redux DevTools and ease installation of React and Redux DevTools.
### Removed
- Dependency of react-infinite.
### Changed
- This project was renamed to pc-nrfconnect-launcher.
- Fewer requests for entering proxy credentials when needed.
- Updated additional app architecture with new design.
