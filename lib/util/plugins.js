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
import { getPluginLocalDir, listDirectories, loadModule } from './fileUtil';

let pluginDir;
let plugin;
const decoratedComponents = {};

function getAvailablePlugins() {
    return listDirectories(getPluginLocalDir());
}

function loadPlugin(name) {
    pluginDir = path.join(getPluginLocalDir(), name);
    plugin = loadModule(pluginDir);
}

function setPlugin(pluginObj) {
    plugin = pluginObj;
    Object.keys(decoratedComponents).forEach(key => {
        delete decoratedComponents[key];
    });
}

/**
 * Get the 'config' property of the plugin.
 *
 * @throws Will throw error if plugin is not loaded or does not have 'config'.
 * @returns {Object} The plugin config object.
 */
function getPluginConfig() {
    if (!plugin) {
        throw new Error('Tried to get plugin configuration, but no plugin is loaded.');
    }
    if (!plugin.config) {
        throw new Error('Tried to get plugin configuration, but plugin does not have a ' +
            '\'config\' property.');
    }
    return plugin.config;
}

/**
 * Get the filesystem path of the currently loaded plugin.
 *
 * @returns {string|undefined} Absolute path of current plugin.
 */
function getPluginDir() {
    return pluginDir;
}

function createDecoratedComponent(parent, name) {
    if (!plugin) {
        return parent;
    }

    let decorated = parent;
    const method = `decorate${name}`;
    const decorateFn = plugin[method];

    if (decorateFn) {
        try {
            decorated = decorateFn(parent, { React });
        } catch (err) {
            throw new Error(`Plugin error when calling '${method}': ${err.message}`);
        }

        if (!decorated || typeof decorated !== 'function') {
            throw new Error(`Plugin error when calling '${method}': ` +
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

function mapToProps(mapSubject, coreMapFn, pluginMapFnName) {
    const coreProps = coreMapFn(mapSubject);
    if (!plugin) {
        return coreProps;
    }

    const pluginMapFn = plugin[pluginMapFnName];
    if (pluginMapFn) {
        if (typeof pluginMapFn !== 'function') {
            throw new Error(`Plugin error when calling '${pluginMapFnName}': ` +
                'Not a function.');
        }

        try {
            return pluginMapFn(mapSubject, coreProps);
        } catch (err) {
            throw new Error(`Plugin error when calling '${pluginMapFnName}': ${err.message}`);
        }
    }
    return coreProps;
}

// Plugins can decorate reducers by implementing reduce${name}
// and returning a new state.
function decorateReducer(coreReducerFn, name) {
    return (state, action) => {
        const coreState = coreReducerFn(state, action);
        if (!plugin) {
            return coreState;
        }

        const method = `reduce${name}`;
        const pluginReducerFn = plugin[method];

        if (pluginReducerFn) {
            if (typeof pluginReducerFn !== 'function') {
                throw new Error(`Plugin error when calling '${method}': ` +
                    'Not a function.');
            }

            try {
                return pluginReducerFn(coreState, action);
            } catch (err) {
                throw new Error(`Plugin error when calling '${method}': ${err.message}`);
            }
        }
        return coreState;
    };
}

// Wrapping the given component with a higher-order component
// provided by the plugin
function decorate(Component, name) {
    return props => {
        const Sub = getDecorated(Component, name);
        return React.createElement(Sub, props);
    };
}

// Connects and decorates a component. Plugins can override
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
    getAvailablePlugins,
    loadPlugin,
    setPlugin,
    decorateReducer,
    decorate,
    connect,
    getPluginConfig,
    getPluginDir,
};
