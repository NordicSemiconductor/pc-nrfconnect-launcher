import React from 'react';
import { Record } from 'immutable';
import { remote } from 'electron';
import path from 'path';

const InitialState = Record({
});
const initialState = new InitialState();

const pluginHomeDir = path.join(remote.getGlobal('homeDir'), path.join('.nrfconnect-plugins', 'local'));

let plugin;

const loadPlugin = name => {
    const pluginPath = path.join(pluginHomeDir, name);

    // Using window.require instead of require, so that webpack
    // ignores it when bundling core
    plugin = window.require(pluginPath);
};

function pluginReducer(state = initialState, action) {
    switch (action.type) {
        default:
            return state;
    }
}

function getDecorated(parent, name) {
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

// Wrapping the given component with a higher-order component
// provided by the plugin
function decorate(Component, name) {
    return props => {
        const Sub = getDecorated(Component, name);
        return React.createElement(Sub, props);
    };
}

export {
    loadPlugin,
    pluginReducer,
    decorate,
};
