/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
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

import 'babel-polyfill';

import React from 'react';
import * as ReactRedux from 'react-redux';
import ReactDOM, { render } from 'react-dom';
import Module from 'module';
import RootContainer from './containers/RootContainer';
import configureStore from '../../store/configureStore';
import { loadApp, invokeAppFn } from '../../util/apps';
import rootReducer from './reducers';
import api from '../../api';
import '../../../resources/css/app.less';

/*
 * The loaded app may import react and react-redux. We must make sure that the
 * app uses the same instances of react and react-redux as we have in core.
 * Cannot have multiple copies of these loaded at the same time.
 */
const originalLoad = Module._load;   // eslint-disable-line no-underscore-dangle
Module._load = function load(path) { // eslint-disable-line no-underscore-dangle
    const hostedModules = {
        react: React,
        'react-dom': ReactDOM,
        'react-redux': ReactRedux,

        'pc-ble-driver-js': api.bleDriver,
        serialport: api.SerialPort,
        electron: api.electron,

        'nrfconnect/pc-ble-driver-js': api.bleDriver,
        'nrfconnect/serialport': api.SerialPort,
        'nrfconnect/electron': api.electron,
        'nrfconnect/programming': api.programming,
        'nrfconnect/core': api.core,
    };

    if (hostedModules[path]) {
        return hostedModules[path];
    }

    return originalLoad.apply(this, arguments); // eslint-disable-line prefer-rest-params
};

const params = new URL(window.location).searchParams;
const appPath = params.get('appPath');
const app = loadApp(appPath);
const store = configureStore(rootReducer, app);

invokeAppFn('onInit', store.dispatch, store.getState);

const removeLoaderElement = () => {
    const element = document.getElementById('app-loader');
    if (element) {
        element.classList.add('loaded');
        setTimeout(() => {
            document.body.removeChild(element);
        }, 500);
    }
};

const rootElement = React.createElement(RootContainer, { store });
render(rootElement, document.getElementById('webapp'), () => {
    removeLoaderElement();
    invokeAppFn('onReady', store.dispatch, store.getState);
});
