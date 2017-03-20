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

import React from 'react';
import { connect as reduxConnect } from 'react-redux';
import path from 'path';
import { getAppLocalDir, listDirectories, loadModule } from './fileUtil';

let appDir;
let app;
const decoratedComponents = {};

function getAvailableApps() {
    return listDirectories(getAppLocalDir());
}

function loadApp(name) {
    appDir = path.join(getAppLocalDir(), name);
    app = loadModule(appDir);
}

function setApp(appObj) {
    app = appObj;
    Object.keys(decoratedComponents).forEach(key => {
        delete decoratedComponents[key];
    });
}

/**
 * Get the 'config' property of the app.
 *
 * @throws Will throw error if app is not loaded or does not have 'config'.
 * @returns {Object} The app config object.
 */
function getAppConfig() {
    if (!app) {
        throw new Error('Tried to get app configuration, but no app is loaded.');
    }
    if (!app.config) {
        throw new Error('Tried to get app configuration, but app does not have a ' +
            '\'config\' property.');
    }
    return app.config;
}

/**
 * Get the filesystem path of the currently loaded app.
 *
 * @returns {string|undefined} Absolute path of current app.
 */
function getAppDir() {
    return appDir;
}

function createDecoratedComponent(parent, name) {
    if (!app) {
        return parent;
    }

    let decorated = parent;
    const method = `decorate${name}`;
    const decorateFn = app[method];

    if (decorateFn) {
        try {
            decorated = decorateFn(parent, { React });
        } catch (err) {
            throw new Error(`App error when calling '${method}': ${err.message}`);
        }

        if (!decorated || typeof decorated !== 'function') {
            throw new Error(`App error when calling '${method}': ` +
                `No React component found. The return value of '${method}' ` +
                'must be a stateless functional component or a class that ' +
                'implements render().');
        }
    }
    return decorated;
}

function getDecorated(parent, name) {
    if (!decoratedComponents[name]) {
        decoratedComponents[name] = createDecoratedComponent(parent, name);
    }
    return decoratedComponents[name];
}

function mapToProps(mapSubject, coreMapFn, appMapFnName) {
    const coreProps = coreMapFn(mapSubject);
    if (!app) {
        return coreProps;
    }

    const appMapFn = app[appMapFnName];
    if (appMapFn) {
        if (typeof appMapFn !== 'function') {
            throw new Error(`App error when calling '${appMapFnName}': ` +
                'Not a function.');
        }

        try {
            return appMapFn(mapSubject, coreProps);
        } catch (err) {
            throw new Error(`App error when calling '${appMapFnName}': ${err.message}`);
        }
    }
    return coreProps;
}

// Apps can decorate reducers by implementing reduce${name}
// and returning a new state.
function decorateReducer(coreReducerFn, name) {
    return (state, action) => {
        const coreState = coreReducerFn(state, action);
        if (!app) {
            return coreState;
        }

        const method = `reduce${name}`;
        const appReducerFn = app[method];

        if (appReducerFn) {
            if (typeof appReducerFn !== 'function') {
                throw new Error(`App error when calling '${method}': ` +
                    'Not a function.');
            }

            try {
                return appReducerFn(coreState, action);
            } catch (err) {
                throw new Error(`App error when calling '${method}': ${err.message}`);
            }
        }
        return coreState;
    };
}

// Wrapping the given component with a higher-order component
// provided by the app
function decorate(Component, name) {
    return props => {
        const Sub = getDecorated(Component, name);
        return React.createElement(Sub, props);
    };
}

// Connects and decorates a component. Apps can override
// mapStateToProps and mapDispatchToProps.
function connect(coreMapStateFn, coreMapDispatchFn, mergeProps, options = {}) {
    return (Component, name) => (
        reduxConnect(
            state => mapToProps(state, coreMapStateFn, `map${name}State`),
            dispatch => mapToProps(dispatch, coreMapDispatchFn, `map${name}Dispatch`),
            mergeProps,
            options,
        )(decorate(Component, name))
    );
}

export default {
    getAvailableApps,
    loadApp,
    setApp,
    decorateReducer,
    decorate,
    connect,
    getAppConfig,
    getAppDir,
};
