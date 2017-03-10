import React from 'react';
import { connect as reduxConnect } from 'react-redux';
import path from 'path';
import { getPluginLocalDir, listDirectories, loadModule } from './fileUtil';

let pluginDir;
let plugin;

function getAvailablePlugins() {
    return listDirectories(getPluginLocalDir());
}

function loadPlugin(name) {
    pluginDir = path.join(getPluginLocalDir(), name);
    plugin = loadModule(pluginDir);
}

function setPlugin(pluginObj) {
    plugin = pluginObj;
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

function getDecorated(parent, name) {
    if (!plugin) {
        return parent;
    }

    const method = `decorate${name}`;
    const decorateFn = plugin[method];

    if (decorateFn) {
        let decorated;
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
        return decorated;
    }

    return parent;
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
