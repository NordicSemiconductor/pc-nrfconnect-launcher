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
    plugin = window.require(pluginPath);
    console.log(pluginPath);
    console.log(plugin);
};

loadPlugin('pc-nrfconnect-ble');

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

        if (!cls || typeof cls.prototype.render !== 'function') {
            console.log('Plugin error', `Invalid return value of \`${method}\`. No \`render\` method found. Please return a \`React.Component\`.`);
            return parent;
        }

        return cls;
    }

    return parent;
}

export function decorate(Component, name) {
    return props => {
        const Sub = getDecorated(Component, name);
        return <Sub {...props} />;
    };
}

export default {
    pluginReducer,
    decorate,
};
