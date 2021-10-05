/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

const fs = require('fs');
const config = require('./config');

let data = null;
let sourcesData = null;

function parseJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
        console.log('Could not load settings. Reason: ', err);
    }
    return {};
}

function load() {
    if (data !== null) {
        return;
    }
    console.log(`Load settings from ${config.getSettingsJsonPath()}`);
    const settings = parseJsonFile(config.getSettingsJsonPath());
    if (settings && typeof settings === 'object') {
        data = settings;
    } else {
        data = {};
    }
}

function save() {
    fs.writeFileSync(config.getSettingsJsonPath(), JSON.stringify(data));
}

function loadSources() {
    if (sourcesData !== null) {
        return;
    }
    let sources = parseJsonFile(config.getSourcesJsonPath());
    if (!sources || typeof sources !== 'object') {
        sources = {};
    }
    sourcesData = {
        ...sources,
        official: config.getAppsJsonUrl(),
    };
}

function saveSources() {
    fs.writeFileSync(config.getSourcesJsonPath(), JSON.stringify(sourcesData));
}

exports.set = (key, value) => {
    load();
    data[key] = value;
    save();
};

exports.get = (key, defaultValue = null) => {
    load();
    let value = defaultValue;

    if (key in data) {
        value = data[key];
    }

    return value;
};

exports.setSources = sources => {
    loadSources();
    sourcesData = sources;
    saveSources();
};

exports.getSources = () => {
    loadSources();
    return sourcesData;
};

exports.unset = key => {
    load();
    if (key in data) {
        delete data[key];
        save();
    }
};

exports.loadLastWindow = () => {
    let lastWindowState = this.get('lastWindowState');

    if (lastWindowState === null) {
        lastWindowState = {
            width: 1024,
            height: 800,
            maximized: false,
        };
    }

    return lastWindowState;
};

exports.storeLastWindow = lastWindowState => {
    const bounds = lastWindowState.getBounds();

    this.set('lastWindowState', {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        maximized: lastWindowState.isMaximized(),
    });
};
