# nRF Connect Core
[![License](https://img.shields.io/badge/license-Modified%20BSD%20License-blue.svg)](LICENSE)

**Note: This repository contains a new version (v2) of nRF Connect that is currently in development. This new version of nRF Connect will be a framework that relies on plugins for providing functionality such as BLE, MESH, Thread, etc. For the current stable version (v1), see https://github.com/NordicSemiconductor/pc-yggdrasil.**

nRF Connect is a cross-platform tool that enables testing and development with development kits from Nordic Semiconductor. The application is designed to be used together with the nRF52 DK, nRF51 DK, or the nRF51 Dongle, running a specific connectivity application.

# Installation

To install the application you can download binaries from the [nRF Connect product page](http://www.nordicsemi.com/eng/Products/Bluetooth-low-energy/nRF-Connect-for-desktop) on Nordic Semiconductor web pages.

nRF Connect currently supports the following operating systems:

* Windows
* Ubuntu Linux 64-bit
* macOS

# Usage documentation

A [Getting started guide](http://infocenter.nordicsemi.com/topic/com.nordic.infocenter.tools/dita/tools/nRF_Connect/nRF_Connect_intro.html?cp=4_2) is available on the nRF Connect product pages.

# Contributing

We are currently working on a Contributor License Agreement (CLA), which will allow third party contributions to this project. We do not accept pull requests for the time being, but feel free to file code related issues on [GitHub Issues](https://github.com/NordicSemiconductor/pc-yggdrasil/issues).

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
* libx11-dev
* libxkbfile-dev

## Building Boost

Before building nRF Connect you will need to have Boost installed and some of its libraries statically compiled. To install and compile Boost, please follow the instructions here:

[Building Boost](https://github.com/NordicSemiconductor/pc-ble-driver/tree/master#building-boost)

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

Firmware detection and programming requires that nRF Connect can load nrfjprog libraries. If you see the message *Could not load nrfjprog DLL* in log at startup, then follow the steps below.

### Windows

Download and install the latest [nRF5x-Command-Line-Tools](https://www.nordicsemi.com/eng/nordic/Products/nRF51822/nRF5x-Command-Line-Tools-Win32/33444), and restart nRF Connect. The nrfjprog libraries will then be loaded from registry.

### Linux and macOS

nRF5x-Command-Line-Tools for Linux and macOS are included in the nrfjprog directory in this repository. In the nRF Connect release artifacts for Linux and macOS, these are set up automatically. However, during development this manual step is required:

Linux:

    tar xf nrfjprog/nRF5x-Command-Line-Tools_*_Linux-x86_64.tar --strip-components=2 -C node_modules/electron-prebuilt/dist

macOS:

    tar xf nrfjprog/nRF5x-Command-Line-Tools_*_OSX.tar --strip-components=2 -C node_modules/electron-prebuilt/dist

This will put the nrfjprog libraries in the same directory as the electron binary in node_modules, so that the application finds them.

## Plugins

TODO.

## Testing

Run unit tests:

    npm test

Run unit tests and watch for changes:

    npm run test-watch

Run end-to-end tests:

    npm run test-e2e

# Related projects
nRF Connect builds on top of other sub components that live in their own GitHub repositories:

* [pc-ble-driver-js](https://github.com/NordicSemiconductor/pc-ble-driver-js)
* [pc-ble-driver](https://github.com/NordicSemiconductor/pc-ble-driver)

# License
See the [license file](LICENSE) for details.

# Feedback
* Ask questions on [DevZone Questions](https://devzone.nordicsemi.com)
* File code related issues on [GitHub Issues](https://github.com/NordicSemiconductor/pc-yggdrasil/issues)
