import React from 'react';
import { connect as reduxConnect } from 'react-redux';
import { Record } from 'immutable';
import { remote } from 'electron';
import path from 'path';
import fs from 'fs';

const InitialState = Record({
});
const initialState = new InitialState();

const pluginHomeDir = path.join(remote.getGlobal('homeDir'), path.join('.nrfconnect-plugins', 'local'));

let plugin;

function getAvailablePlugins() {
    if (fs.existsSync(pluginHomeDir)) {
        return fs.readdirSync(pluginHomeDir)
            .filter(file => {
                const fileStats = fs.statSync(path.join(pluginHomeDir, file));
                return fileStats.isDirectory();
            });
    }
    return [];
}

function loadPlugin(name) {
    const pluginPath = path.join(pluginHomeDir, name);
    const pluginManifest = path.join(pluginPath, 'package.json');

    if (!fs.existsSync(pluginManifest)) {
        console.log(`Trying to load plugin '${name}', but package.json ` +
            `is missing in ${pluginPath}.`);
        return;
    }

    // Using window.require instead of require, so that webpack
    // ignores it when bundling core
    plugin = window.require(pluginPath);
}

function pluginReducer(state = initialState, action) {
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
