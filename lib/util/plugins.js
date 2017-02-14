import React from 'react';
import { connect as reduxConnect } from 'react-redux';
import { Record } from 'immutable';
import path from 'path';
import { getPluginLocalDir, listDirectories, loadModule } from './fileUtil';

let plugin;

function getAvailablePlugins() {
    return listDirectories(getPluginLocalDir());
}

function loadPlugin(name) {
    const pluginDir = path.join(getPluginLocalDir(), name);
    plugin = loadModule(pluginDir);
}

function setPlugin(pluginObj) {
    plugin = pluginObj;
}

function pluginReducer(state = Record({}), action) {
    // TODO: Use reducer from plugin
    switch (action.type) {
        default:
            return state;
    }
}

function getDecorated(parent, name) {
    if (!plugin) {
        return parent;
    }

    const method = `decorate${name}`;
    const decorateFn = plugin[method];

    let decorated;
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
        try {
            return pluginMapFn(mapSubject, coreProps);
        } catch (err) {
            console.error(err.stack);
        }
    }
    return coreProps;
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

export {
    getAvailablePlugins,
    loadPlugin,
    setPlugin,
    pluginReducer,
    decorate,
    connect,
};
