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
    const fn = plugin[method];

    if (fn) {
        let cls;

        try {
            cls = fn(parent, { React });
        } catch (err) {
            console.error(err.stack);
            return parent;
        }

        return cls;
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
    pluginReducer,
    decorate,
    connect,
};
