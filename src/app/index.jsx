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

import 'core-js/es7';
import 'regenerator-runtime/runtime';

import './module-loader';

import React from 'react';
import { remote } from 'electron';
import ReactDOM from 'react-dom';
import initApp from './initApp';
import legacyRenderer from '../legacy/legacyRenderer';

const params = new URL(window.location).searchParams;
const appPath = params.get('appPath');

const removeLoaderElement = () => {
    const element = document.getElementById('app-loader');
    if (element) {
        element.classList.add('loaded');
        setTimeout(() => {
            document.body.removeChild(element);
        }, 500);
    }
};

const isLegacy = app => typeof app === 'object';

const renderer = (App, container, onLoaded) => {
    // The next line is only needed as long as we still need to support legacy apps.
    // Later, when we want to drop support for legacy apps, change "legacy.css" in
    // app.html to "shared.css" and remove the next line
    document.getElementById('stylesheet').href = '../dist/shared.css';

    ReactDOM.render(<App />, container, onLoaded);
};

const render = app => {
    const doRender = isLegacy(app)
        ? legacyRenderer
        : renderer;

    doRender(app, document.getElementById('webapp'), removeLoaderElement);
};

const showLoadingError = error => {
    console.error(error);
    remote.dialog.showMessageBox({
        type: 'error',
        message: error.message,
    });
};

initApp(appPath)
    .then(render)
    .catch(showLoadingError);
