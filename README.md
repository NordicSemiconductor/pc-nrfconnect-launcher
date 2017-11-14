# nRF Connect
[![License](https://img.shields.io/badge/license-Modified%20BSD%20License-blue.svg)](LICENSE)

nRF Connect is a cross-platform framework for creating desktop apps for use with development kits from Nordic Semiconductor. It provides a common foundation for creating apps that communicate with the development kits over serial port. The framework comes with a skeleton that has standard UI components for listing serial ports, navigation menus, logging, etc. Apps can decorate the standard components, create new components, and use built-in libraries in order to create end-user tools.

nRF Connect is designed to be used with:

* nRF52 DK
* nRF51 DK
* nRF51 Dongle

# Installation

To install nRF Connect you can download binaries from the [nRF Connect product page](http://www.nordicsemi.com/eng/Products/Bluetooth-low-energy/nRF-Connect-for-desktop) on Nordic Semiconductor web pages.

nRF Connect currently supports the following operating systems:

* Windows
* Ubuntu Linux 64-bit
* macOS

# Usage documentation

A [Getting started guide](http://infocenter.nordicsemi.com/topic/com.nordic.infocenter.tools/dita/tools/nRF_Connect/nRF_Connect_intro.html?cp=4_2) is available on the nRF Connect product pages.

# Available apps

The following apps have been created for nRF Connect;

* [Bluetooth Low Energy](https://www.npmjs.com/package/pc-nrfconnect-ble)
* [RSSI Viewer](https://www.npmjs.com/package/pc-nrfconnect-rssi)
* [nRF Cloud Gateway](https://www.npmjs.com/package/nrf-cloud-gateway)

## Automatic installation of apps

The normal way to install apps is to start nRF Connect and go to the *Add/remove apps* screen. When installing apps from this screen, you will be notified of any new releases, and have the option to upgrade when new releases are available.

## Manual installation of apps

If you are unable to install apps from the *Add/remove apps* screen, it is also possible to install apps manually:

1. Go to the app's page on the npm website by following the links above, and locate the name and the latest version of the app.
2. Download the app by using the URL `https://registry.npmjs.org/<name>/-/<name>-<version>.tgz`, and save the file to `%USERPROFILE%\.nrfconnect-apps\local` (Windows) or `$HOME/.nrfconnect-apps/local` (Linux/macOS).
3. Restart nRF Connect. The app should now appear in the *Launch app* screen.

# Creating apps

To create your own app, follow the documentation on the [project wiki](https://github.com/NordicSemiconductor/pc-nrfconnect-core/wiki). Have a look at the [RSSI viewer app](https://github.com/NordicSemiconductor/pc-nrfconnect-rssi) to see how a real-world app can be implemented. There is also a [boilerplate app](https://github.com/NordicSemiconductor/pc-nrfconnect-boilerplate) that can be used as a starting point.

# Proxy settings

To configure nRF Connect for use behind a proxy, see [proxy settings](https://github.com/NordicSemiconductor/pc-nrfconnect-core/blob/master/doc/proxy-settings.md).

# Contributing

Feel free to file code related issues on [GitHub Issues](https://github.com/NordicSemiconductor/pc-nrfconnect-core/issues) and/or submit a pull request. In order to accept your pull request, we need you to sign our Contributor License Agreement (CLA). You will see instructions for doing this after having submitted your first pull request. You only need to sign the CLA once, so if you have already done it for another project in the NordicSemiconductor organization, you are good to go.

# Compiling from source

## Dependencies

To build this project you will need to install the following tools:

* Node.js (>=6.9)
* npm (>=3.7.0)
* CMake (>=2.8.12)
* A C/C++ toolchain (see [Building Boost](#building-boost) for description of toolchain requirements)

Since building nRF Connect also involves building *pc-ble-driver-js*, please refer to the described requirements in

* [pc-ble-driver-js README](https://github.com/NordicSemiconductor/pc-ble-driver-js) for procedures and description of required tools.

### Linux

To build the project on Ubuntu Linux, the following packages need to be installed:

* libudev-dev

### Windows

Install all the required tools and configurations using Microsoft's windows-build-tools from an elevated PowerShell or CMD.exe (run as Administrator):

    npm install --global --production windows-build-tools

## Building Boost

Before building nRF Connect you will need to have Boost installed and some of its libraries statically compiled. To install and compile Boost, please follow the instructions here:

[Building Boost](https://github.com/NordicSemiconductor/pc-ble-driver/blob/master/Installation.md#building-boost)

Note: Make sure you have built the Boost libraries for the architecture (32 or 64-bit) required by your Node installation.

## Compiling

When all required tools and environment variables have been installed and set, you are ready to start the compilation. Run the following command from the command line, standing in the root folder of the repository:

    npm install

## Development

Start by running:

    npm run dev

This will transpile, lint, and bundle all code into the `dist` directory. The process will watch for changes to source code, and re-bundle to `dist` on each change.

Now, open a separate terminal window and run:

    npm run app

This will open Electron, which loads its content from `dist`.

## Firmware detection and programming

Firmware detection and programming requires that nRF Connect can load nrfjprog libraries. If you see the message *CouldNotFindJprogDLL* in the log, then follow the steps below.

### Windows

Download and install the latest [nRF5x-Command-Line-Tools](https://www.nordicsemi.com/eng/nordic/Products/nRF51822/nRF5x-Command-Line-Tools-Win32/33444), and restart nRF Connect. The nrfjprog libraries will then be loaded from registry.

### Linux and macOS

J-Link driver needs to be separately installed on Linux and macOS, download and install appropriate package for your operating system from [SEGGER](https://www.segger.com/downloads/jlink) under the section *J-Link Software and Documentation Pack*.

## Testing

Run unit tests:

    npm test

Run unit tests and watch for changes:

    npm run test-watch

Run all end-to-end tests:

    npm run test-e2e

Run only end-to-end tests that do not require network access:

    npm run test-e2e-offline

Run only end-to-end tests that require network access:

    npm run test-e2e-online

## Creating release artifacts

To pack nRF Connect into a release artifact for the current platform:

    npm run pack

Depending on the platform, this will create:

* Windows: NSIS installer
* macOS: DMG disk image
* Linux: tar.gz archive

# Related projects

nRF Connect builds on top of other sub components that live in their own GitHub repositories:

* [pc-ble-driver-js](https://github.com/NordicSemiconductor/pc-ble-driver-js)
* [pc-ble-driver](https://github.com/NordicSemiconductor/pc-ble-driver)
* [pc-nrfjprog-js](https://github.com/NordicSemiconductor/pc-nrfjprog-js)

# License

See the [license file](LICENSE) for details.

# Feedback

* Ask questions on [DevZone Questions](https://devzone.nordicsemi.com)
* File code related issues on [GitHub Issues](https://github.com/NordicSemiconductor/pc-nrfconnect-core/issues)
