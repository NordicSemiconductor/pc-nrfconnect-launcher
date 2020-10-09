/* Copyright (c) 2015 - 2019, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* eslint-disable no-underscore-dangle */
import Module from 'module';
import semver from 'semver';
import { readJsonFile } from '../main/fileUtil';

const hostedModules = {};

/*
 * The loaded app may import react and react-redux. We must make sure that the
 * app uses the same instances of react and react-redux as we have in core.
 * Cannot have multiple copies of these loaded at the same time.
 */
const originalLoad = Module._load;
Module._load = function load(modulePath) {
    if (hostedModules[modulePath]) {
        return hostedModules[modulePath];
    }

    return originalLoad.apply(this, arguments); // eslint-disable-line prefer-rest-params
};

const SerialPort = require('serialport');

let hasShownDeprecatedPropertyWarning = false;
const mayShowWarningAboutDeprecatedProperty = () => {
    if (!hasShownDeprecatedPropertyWarning) {
        console.warn(
            'Using the property "comName" has been deprecated. You should now use "path". The property will be removed in the next major release.'
        );
    }
    hasShownDeprecatedPropertyWarning = true;
};
const ducktapeComName = port => ({
    ...port,
    get comName() {
        mayShowWarningAboutDeprecatedProperty();
        return port.path;
    },
});

const originalSerialPortList = SerialPort.list;
SerialPort.list = () =>
    originalSerialPortList().then(ports => ports.map(ducktapeComName));

/* eslint-disable dot-notation */
// Disable dot-notation in this file, to keep the syntax below more consistent
hostedModules['serialport'] = SerialPort;

hostedModules['electron'] = require('electron');
hostedModules['nrf-device-setup'] = require('nrf-device-setup');
hostedModules['nrfconnect/core'] = require('../legacy/api').core;
hostedModules['pc-nrfconnect-shared'] = require('pc-nrfconnect-shared');
hostedModules['pc-nrfjprog-js'] = require('pc-nrfjprog-js');
hostedModules['react-dom'] = require('react-dom');
hostedModules['react-redux'] = require('react-redux');
hostedModules['react'] = require('react');
hostedModules['redux-devtools-extension'] = require('redux-devtools-extension');
hostedModules['redux-thunk'] = require('redux-thunk');
hostedModules['usb'] = require('usb');

const bleDriverJs = require('pc-ble-driver-js');

const bleDriver = bleDriverJs.api ? bleDriverJs.api : bleDriverJs;
hostedModules['pc-ble-driver-js'] = bleDriver;

// Temporary workaround. To be removed after all the related apps are updated.
// Electron dialog api change breaks the behaviour of show[Open|Save]Dialog() calls.
// Update apps by either calling the synchronous version or to expect
// a Promise return value. After updating change the required minimum nrfconnect
// engine version to 3.6+ in package.json
const params = new URL(window.location).searchParams;
const appPath = params.get('appPath');
readJsonFile(`${appPath}/package.json`)
    .then(({ engines }) => {
        const { nrfconnect } = engines || {};
        if (nrfconnect && semver.lt(semver.minVersion(nrfconnect), '3.6.0')) {
            const { dialog } = hostedModules['electron'].remote;

            dialog.showSaveDialog = (...args) => {
                const lastArg = args[args.length - 1];
                const result = dialog.showSaveDialogSync(...args);
                if (typeof lastArg === 'function') {
                    const callback = lastArg;
                    callback(result);
                }
                return result;
            };

            dialog.showOpenDialog = (...args) => {
                const lastArg = args[args.length - 1];
                const result = dialog.showOpenDialogSync(...args);
                if (typeof lastArg === 'function') {
                    const callback = lastArg;
                    callback(result);
                }
                return result;
            };

            console.log('Electron dialog api is has been patched.');
        }
    })
    .catch(() => {});
