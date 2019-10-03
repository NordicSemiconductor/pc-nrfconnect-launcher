# nRF Connect for Desktop

[![Build Status](https://dev.azure.com/NordicSemiconductor/Wayland/_apis/build/status/pc-nrfconnect-core?branchName=master)](https://dev.azure.com/NordicSemiconductor/Wayland/_build/latest?definitionId=8&branchName=master)
[![License](https://img.shields.io/badge/license-Modified%20BSD%20License-blue.svg)](LICENSE)

nRF Connect for Desktop is a cross-platform framework for desktop apps for development kits or dongles from Nordic Semiconductor. The framework provides a launcher and the general layout for selecting devices, navigation menus, logging, etc. Apps can decorate the standard components and use built-in libraries in order to create end-user tools.

# Supported Platforms

While it may vary in individual apps, nRF Connect for Desktop aims to support all official Nordic Semiconductor development kits and dongles from these series:

* nRF51
* nRF52
* nRF91

You can run nRF Connect for Desktop on:

* Windows
* Ubuntu Linux 64-bit
* macOS

# Using nRF Connect for Desktop

## Prerequisites

### macOS and Linux

J-Link driver needs to be separately installed on macOS and Linux. Download and install it from [SEGGER](https://www.segger.com/downloads/jlink) under the section *J-Link Software and Documentation Pack*. Without it when running the apps you would otherwise get error messages when running the apps like `CouldNotFindJprogDLL`, `CouldNotOpenDLL` or `JLINKARM_DLL_NOT_FOUND`.

#### Linux only

In order to access Nordic USB devices with correct permissions *udev* rules need to be set up once. For this purpose [nrf-udev](https://github.com/NordicSemiconductor/nrf-udev) repository has been created, follow instructions there.

## Installation

Download binaries from the [nRF Connect for Desktop product page](https://www.nordicsemi.com/Software-and-Tools/Development-Tools/nRF-Connect-for-desktop) on Nordic Semiconductor web pages.

## Running

When starting nRF Connect for Desktop a central launcher is shown. It enables you to install, update and launch the individual apps. Currently provided by Nordic Semiconductor are:

* [Bluetooth Low Energy](https://github.com/NordicSemiconductor/pc-nrfconnect-ble)
* [Power Profiler](https://github.com/NordicSemiconductor/pc-nrfconnect-ppk)
* [Programmer](https://github.com/NordicSemiconductor/pc-nrfconnect-programmer)
* [RSSI Viewer](https://github.com/NordicSemiconductor/pc-nrfconnect-rssi)
* [LTE Link Monitor](https://github.com/NordicSemiconductor/pc-nrfconnect-linkmonitor)
* [Getting Started Assistant](https://github.com/NordicSemiconductor/pc-nrfconnect-gettingstarted)
* [Trace Collector](https://github.com/NordicSemiconductor/pc-nrfconnect-tracecollector)

[Further documentation on some apps is provided in the Nordic Semiconductor Infocenter](https://infocenter.nordicsemi.com/topic/struct_nrftools/struct/nrftools_nrfconnect.html).

## Proxy settings

To use behind a proxy, see [proxy settings](https://github.com/NordicSemiconductor/pc-nrfconnect-core/blob/master/doc/proxy-settings.md).

## Manual installation of apps

Should you have an app package offline, it is also possible to install it manually:

1. Copy the file to `%USERPROFILE%\.nrfconnect-apps\local` (Windows) or `$HOME/.nrfconnect-apps/local` (Linux/macOS).
2. Restart nRF Connect for Desktop. The app should now appear in the apps list.

# Contributing

## Pull requests

Feel free to submit a pull request. In order to accept your pull request, we need you to sign our Contributor License Agreement (CLA). You will see instructions for doing this after having submitted your first pull request. You only need to sign the CLA once, so if you have already done it for another project in the NordicSemiconductor organization, you are good to go.

## Reporting bugs

If you find any bugs, or have questions or other feedback in general, please submit a post on the [Nordic DevZone](http://devzone.nordicsemi.no) portal.
Note that bug reports should describe in sufficient detail how to reproduce the bug.

# Developing

If you either want to program new apps for nRF Connect for Desktop or work on the existing core and apps, you probably want to use the sources to compile and run them locally. You find more in-depth info on this in the [developer documentation](https://nordicsemiconductor.github.io/pc-nrfconnect-docs/).

## Prerequisites

To build this project you need [Node.js](https://nodejs.org/).

### Linux

Install additionally required packages for building the project on Ubuntu Linux:

    apt-get install build-essential python2.7 libudev-dev libgconf-2-4

### Windows

Install additionally required tools and configurations using Microsoft's windows-build-tools from an elevated PowerShell or CMD.exe (run as Administrator):

    npm install --global --production windows-build-tools

## Running from source

When the prerequisites are met install the needed dependencies by running:

    npm install

Start the continuous compilation by running:

    npm run dev

This will transpile, lint, and bundle all code into the `dist` directory. The process will watch for changes to source code, and re-bundle to `dist` on each change.

Now, open a separate terminal window and run:

    npm run app

This will open Electron, which loads its content from `dist`.

### Testing

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

### Creating new apps

Have a look at the [RSSI viewer app](https://github.com/NordicSemiconductor/pc-nrfconnect-rssi) to see how a real-world app can be implemented. There is also a [boilerplate app](https://github.com/NordicSemiconductor/pc-nrfconnect-boilerplate) that can be used as a starting point.

### Compilation of native modules

The project depends on [pc-ble-driver-js](https://github.com/NordicSemiconductor/pc-ble-driver-js) and [pc-nrfjprog-js](https://github.com/NordicSemiconductor/pc-nrfjprog-js) which are native modules. Pre-compiled binaries for these modules are provided for recent Node.js versions on Windows, macOS, and Linux. However, if binaries do not exist for your platform/Node.js version, then refer to the [pc-ble-driver-js README](https://github.com/NordicSemiconductor/pc-ble-driver-js) which describes requirements for compilation.

# Related projects

nRF Connect for Desktop builds on top of other sub components that live in their own GitHub repositories:

* [pc-ble-driver-js](https://github.com/NordicSemiconductor/pc-ble-driver-js)
* [pc-ble-driver](https://github.com/NordicSemiconductor/pc-ble-driver)
* [pc-nrfjprog-js](https://github.com/NordicSemiconductor/pc-nrfjprog-js)
* [nrf-device-lister-js](https://github.com/NordicSemiconductor/nrf-device-lister-js)
* [nrf-device-setup-js](https://github.com/NordicSemiconductor/nrf-device-setup-js)

# License

See the [license file](LICENSE) for details.
