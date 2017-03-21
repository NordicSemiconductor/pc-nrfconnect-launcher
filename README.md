# nRF Connect
[![License](https://img.shields.io/badge/license-Modified%20BSD%20License-blue.svg)](LICENSE)

**Note: This repository contains a new version (v2) of nRF Connect that is currently in development. While v1 was a pure BLE tool, v2 will be a framework for creating and loading desktop apps.**

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

### Windows

Install all the required tools and configurations using Microsoft's windows-build-tools from an elevated PowerShell or CMD.exe (run as Administrator):

    npm install --global --production windows-build-tools

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

    tar xf nrfjprog/nRF5x-Command-Line-Tools_*_Linux-x86_64.tar --strip-components=2 -C node_modules/electron/dist

macOS:

    tar xf nrfjprog/nRF5x-Command-Line-Tools_*_OSX.tar --strip-components=2 -C node_modules/electron/dist

This will put the nrfjprog libraries in the same directory as the electron binary in node_modules, so that the application finds them.

## Testing

Run unit tests:

    npm test

Run unit tests and watch for changes:

    npm run test-watch

Run end-to-end tests:

    npm run test-e2e

## Creating apps

**Note: The API for apps is in development and may change before the final release.**

The nRF Connect framework provides a foundation for creating desktop apps. It comes with a set of core components that can be decorated/overridden to suit each app's needs, and has built-in functionality for serial port communication, programming, BLE, and logging. The API for apps is inspired by [Hyper](https://hyper.is/), which is an extensible terminal emulator created with Electron, React, and Redux. Basic knowledge of React and Redux is recommended in order to write apps.

Apps can:

* Decorate/override the core React components to display custom content.
* Modify the behavior of the core React components by passing in custom properties.
* Use the core API for things like BLE operations, programming, and logging.
* Read and update Redux state by creating custom actions and reducers.

nRF Connect looks for apps in `$HOME/.nrfconnect-apps/local`. For now, it just loads the first app it finds in this directory. In the future, the user will be able to choose which app to use at startup.

### API for apps

Apps are npm packages that export a plain JavaScript object. The object should have one or more methods or properties, as described in the sections below, and is typically exported by `index.js` in the app's root directory:

    module.exports = {
        // methods and properties
    };

nRF Connect respects the `main` field in the app's package.json, so the entry file can be changed to something other than `index.js` if necessary.

#### Methods

<table>
  <tbody>
    <tr>
      <th>Method</th>
      <th>Description and parameters</th>
    </tr>
    <tr>
      <td>
        <code>decorateFirmwareDialog</code><br />
        <code>decorateLogo</code><br />
        <code>decorateLogEntry</code><br />
        <code>decorateLogHeader</code><br />
        <code>decorateLogHeaderButton</code><br />
        <code>decorateLogViewer</code><br />
        <code>decorateMainMenu</code><br />
        <code>decorateMainView</code><br />
        <code>decorateNavBar</code><br />
        <code>decorateNavMenu</code><br />
        <code>decorateSerialPortSelector</code><br />
        <code>decorateSerialPortSelectorItem</code><br />
        <code>decorateSidePanel</code>
      </td>
      <td>
        <p>Invoked with the component that is to be decorated. Must return a Higher-Order Component (HOC).</p>
        <table>
          <tbody>
            <tr>
              <td><code>Component</code></td>
              <td>The component to decorate.</td>
            </tr>
            <tr>
              <td><code>env</code></td>
              <td>The environment object. Currently only contains a reference to <code>React</code>.</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <code>mapFirmwareDialogDispatch</code><br />
        <code>mapLogHeaderDispatch</code><br />
        <code>mapLogViewerDispatch</code><br />
        <code>mapMainMenuDispatch</code><br />
        <code>mapMainViewDispatch</code><br />
        <code>mapNavMenuDispatch</code><br />
        <code>mapSerialPortSelectorDispatch</code><br />
        <code>mapSidePanelDispatch</code><br />
      </td>
      <td>
        <p>Allows overriding props that are passed to the components. Receives <code>dispatch</code> and the original <code>props</code>, and must return a new map of props.</p>
        <table>
          <tbody>
            <tr>
              <td><code>dispatch</code></td>
              <td>The Redux dispatch function.</td>
            </tr>
            <tr>
              <td><code>props</code></td>
              <td>The original props that were passed to the component.</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <code>mapFirmwareDialogState</code><br />
        <code>mapLogHeaderState</code><br />
        <code>mapLogViewerState</code><br />
        <code>mapMainMenuState</code><br />
        <code>mapMainViewState</code><br />
        <code>mapNavMenuState</code><br />
        <code>mapSerialPortSelectorState</code><br />
        <code>mapSidePanelState</code><br />
      </td>
      <td>
        <p>Allows overriding props that are passed to the components. Receives the <code>state</code> object and the original <code>props</code>, and must return a new map of props.</p>
        <table>
          <tbody>
            <tr>
              <td><code>state</code></td>
              <td>The Redux state object.</td>
            </tr>
            <tr>
              <td><code>props</code></td>
              <td>The original props that were passed to the component.</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <code>reduceFirmwareDialog</code><br />
        <code>reduceLog</code><br />
        <code>reduceNavMenu</code><br />
        <code>reduceSerialPort</code>
      </td>
      <td>
        <p>Invoked right after the corresponding core reducer function. Receives the state and action, and returns a new state.</p>
        <table>
          <tbody>
            <tr>
              <td><code>state</code></td>
              <td>The part of the state that the reducer is concerned with.</td>
            </tr>
            <tr>
              <td><code>action</code></td>
              <td>The action that was dispatched.</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <code>reduceApp</code><br />
      </td>
      <td>
        <p>Invoked when an action is dispatched. This is where the app can keep its own custom state. Multiple reducers may be nested below this by using `combineReducers` from react-redux.</p>
        <table>
          <tbody>
            <tr>
              <td><code>state</code></td>
              <td>The part of the state that the reducer is concerned with.</td>
            </tr>
            <tr>
              <td><code>action</code></td>
              <td>The action that was dispatched.</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>

#### Properties

<table>
  <tbody>
    <tr>
      <th>Property</th>
      <th>Description</th>
    </tr>
    <tr>
      <td>
        <code>config</code><br />
      </td>
      <td>
        <p>Property that is used for general configuration. This can be added to the app object, similar to the methods, and supports the settings described below.</p>
        <table>
          <tbody>
            <tr>
              <td><code>firmwareData</code></td>
              <td>
                <p>Firmware hex string to program when user selects serial port.</p>
                <p>Must be an object that has one (or both) of the following properties:</p>
                <pre>{
  nrf51: 'nrf51-hex-string',
  nrf52: 'nrf52-hex-string',
}</pre>
                <p>Note that <code>firmwareData</code> and <code>firmwarePaths</code> should not be used simultaneously.</p>
              </td>
            </tr>
            <tr>
              <td><code>firmwarePaths</code></td>
              <td>
                <p>Paths to firmware hex files to program when user selects serial port. Paths are relative to the app's root directory.</p>
                <p>Must be an object that has one (or both) of the following properties:</p>
                <pre>{
  nrf51: './path/to/nrf51-firmware.hex',
  nrf52: './path/to/nrf52-firmware.hex',
}</pre>
                <p>Note that <code>firmwareData</code> and <code>firmwarePaths</code> should not be used simultaneously.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>

#### API operations

When implementing the `map*Dispatch` methods, apps can create and dispatch custom actions. When dispatching actions, the action creator get access to an `api` object that enables using the logger, serial ports, BLE, and programming. Below is an example that adds a log message when the user selects a serial port.

    function logSelectedPort(port) {
        return (dispatch, getState, api) => {
            const { logger } = api;
            logger.info(`Serial port ${port.comName} was selected`);
        };
    }
    
    module.exports = {
        mapSerialPortSelectorDispatch: (dispatch, props) => ({
            ...props,
            onSelect: port => dispatch(logSelectedPort(port)),
        }),
    };

As can be seen in this example, when passing a function to `dispatch`, it will receive the `api` object as the third parameter. Here we pull out the `logger`, and use that to add a log message.

The properties provided by the `api` object are described below.

<table>
  <tbody>
    <tr>
      <th>Property</th>
      <th>Description</th>
    </tr>
    <tr>
      <td>
        <code>ble</code>
      </td>
      <td>
        <p>BLE operations. Refer to the <a href="https://github.com/NordicSemiconductor/pc-nrfconnect-core/blob/master/lib/api/ble/index.js">BLE API source code</a>.</p>
      </td>
    </tr>
    <tr>
      <td>
        <code>logger</code>
      </td>
      <td>
        <p>The application logger, which is a Winston logger instance. Refer to the <a href="https://github.com/winstonjs/winston">Winston documentation</a>.</p>
      </td>
    </tr>
    <tr>
      <td>
        <code>programming</code>
      </td>
      <td>
        <p>Programming operations. Refer to the <a href="https://github.com/NordicSemiconductor/pc-nrfconnect-core/blob/master/lib/api/programming/index.js">programming API source code</a>.</p>
      </td>
    </tr>
    <tr>
      <td>
        <code>SerialPort</code>
      </td>
      <td>
        <p>A reference to the serialport library. Refer to the <a href="https://github.com/EmergingTechnologyAdvisors/node-serialport">serialport documentation</a>.</p>
      </td>
    </tr>
  </tbody>
</table>

### Hello World app

Create the app root directory if it does not already exist:

    mkdir -p $HOME/.nrfconnect-apps/local

Create a directory for the Hello World app:

    cd $HOME/.nrfconnect-apps/local
    mkdir pc-nrfconnect-helloworld

In the app directory, initialize a new npm project (just accept the defaults):

    cd pc-nrfconnect-helloworld
    npm init

Add an `index.js` file in `pc-nrfconnect-helloworld` with the following contents:

    module.exports = {
        decorateMainView: (MainView, { React }) => (
            props => React.createElement(MainView, props, 'Hello World!')
        ),
    };

When reloading (Ctrl+R) the application, it should now print "Hello World!" in the main view and "Loaded app: pc-nrfconnect-helloworld" should be shown in the log viewer.

The app implements a `decorateMainView` function, which tells nRF Connect that the app wants to decorate/override the core `MainView` component. We are using the [Higher-Order Component (HOC)](https://facebook.github.io/react/docs/higher-order-components.html) pattern here. The `decorateMainView` function receives the core `MainView` component as a parameter. In addition, the function receives a reference to the `React` library so that it can create new elements.
 
In the body of `decorateMainView` we return a [functional React component](https://facebook.github.io/react/docs/components-and-props.html#functional-and-class-components). A React class could also have been returned here. This receives the props that were originally passed to `MainView` by nRF Connect, and renders the `MainView` component with "Hello World!" as a child.

### Beyond Hello World

We are working on a proof-of-concept app that will demonstrate a real-world use case. Also, in many cases it will make sense to pull in tools like Webpack and Babel in order to use JSX syntax, plus tools for linting and unit testing. We are considering adding a skeleton/boilerplate for this.

# Related projects
nRF Connect builds on top of other sub components that live in their own GitHub repositories:

* [pc-ble-driver-js](https://github.com/NordicSemiconductor/pc-ble-driver-js)
* [pc-ble-driver](https://github.com/NordicSemiconductor/pc-ble-driver)

# License
See the [license file](LICENSE) for details.

# Feedback
* Ask questions on [DevZone Questions](https://devzone.nordicsemi.com)
* File code related issues on [GitHub Issues](https://github.com/NordicSemiconductor/pc-yggdrasil/issues)
