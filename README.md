# nRF Connect

[![Build Status](https://dev.azure.com/NordicSemiconductor/Wayland/_apis/build/status/pc-nrfconnect-core?branchName=master)](https://dev.azure.com/NordicSemiconductor/Wayland/_build/latest?definitionId=8&branchName=master)
[![License](https://img.shields.io/badge/license-Modified%20BSD%20License-blue.svg)](LICENSE)

nRF Connect is a cross-platform framework for creating desktop apps for use with development kits or dongles from Nordic Semiconductor. It provides a common foundation for creating apps that communicate with the devices over serial port. The framework comes with a skeleton that has standard UI components for selecting devices, navigation menus, logging, etc. Apps can decorate the standard components, create new components, and use built-in libraries in order to create end-user tools.

nRF Connect supports the following devices:

* PCA10028 nRF51 Development Kit
* PCA10031 nRF51 Dongle
* PCA10040 nRF52 Development Kit
* PCA10056 nRF52840 Development Kit
* PCA10059 nRF52840 Dongle

Note that while the nRF Connect framework has support for all these devices, the device support in nRF Connect apps may vary.

# Installation

To install nRF Connect you can download binaries from the [nRF Connect product page](https://www.nordicsemi.com/eng/Products/Bluetooth-low-energy/nRF-Connect-for-Desktop#Downloads) on Nordic Semiconductor web pages.

nRF Connect currently supports the following operating systems:

* Windows
* Ubuntu Linux 64-bit
* macOS

# Usage documentation

A [Getting started guide](https://www.nordicsemi.com/eng/Products/Bluetooth-low-energy/nRF-Connect-for-Desktop#Documentation) is available from the nRF Connect product pages.

# Available apps

The following apps have been created for nRF Connect;

* [Bluetooth Low Energy](https://www.npmjs.com/package/pc-nrfconnect-ble)
* [Power Profiler](https://www.npmjs.com/package/pc-nrfconnect-ppk)
* [Programmer](https://www.npmjs.com/package/pc-nrfconnect-programmer)
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

# Linux udev rules

In order to access Nordic USB devices with correct permissions *udev* rules need to be set up once. For this purpose [nrf-udev](https://github.com/NordicSemiconductor/nrf-udev) repository has been created, follow instructions there.

# Contributing

Feel free to submit a pull request. In order to accept your pull request, we need you to sign our Contributor License Agreement (CLA). You will see instructions for doing this after having submitted your first pull request. You only need to sign the CLA once, so if you have already done it for another project in the NordicSemiconductor organization, you are good to go.

# Reporting bugs

If you find any bugs, or have questions or other feedback in general, please submit a post on the [Nordic DevZone](http://devzone.nordicsemi.no) portal.
Note that bug reports should describe in sufficient detail how to reproduce the bug.

# Building from source

## Dependencies

To build this project you will need to install the following tools:

* Node.js (>=6.9)
* npm (>=5.6.0) / yarn (>=1.4.0)

### Compilation of native modules

The project depends on [pc-ble-driver-js](https://github.com/NordicSemiconductor/pc-ble-driver-js) and [pc-nrfjprog-js](https://github.com/NordicSemiconductor/pc-nrfjprog-js) which are native modules. Pre-compiled binaries for these modules are provided for recent Node.js versions on Windows, macOS, and Linux. However, if binaries do not exist for your platform/Node.js version, then refer to the [pc-ble-driver-js README](https://github.com/NordicSemiconductor/pc-ble-driver-js) which describes requirements for compilation.

### Linux

Install packages required for building the project on Ubuntu Linux:

    apt-get install build-essential python2.7 libudev-dev libgconf-2-4

### Windows

Install all the required tools and configurations using Microsoft's windows-build-tools from an elevated PowerShell or CMD.exe (run as Administrator):

    npm install --global --production windows-build-tools

## Building

When all required tools have been installed, you are ready to build the project. Run the following command from the command line, standing in the root folder of the repository:

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
* Linux: AppImage

The artifact is written to the `release` directory.

## Publishing release artifacts

First, make sure your user can authenticate with GitHub:

* Windows: `set GH_TOKEN=<your-github-token>`
* Linux/macOS: `export GH_TOKEN=<your-github-token>`

Then, to create and publish the release artifact:

    npm run release

This creates a release artifact for the current platform, and uploads it to GitHub as part of a draft release on the [GitHub releases](https://github.com/NordicSemiconductor/pc-nrfconnect-core/releases) page. The draft release is only visible to users who have write access to the repository, and can be made public by editing it and pressing the *Publish release* button.

# Related projects

nRF Connect builds on top of other sub components that live in their own GitHub repositories:

* [pc-ble-driver-js](https://github.com/NordicSemiconductor/pc-ble-driver-js)
* [pc-ble-driver](https://github.com/NordicSemiconductor/pc-ble-driver)
* [pc-nrfjprog-js](https://github.com/NordicSemiconductor/pc-nrfjprog-js)
* [nrf-device-lister-js](https://github.com/NordicSemiconductor/nrf-device-lister-js)
* [nrf-device-setup-js](https://github.com/NordicSemiconductor/nrf-device-setup-js)

# License

See the [license file](LICENSE) for details.
