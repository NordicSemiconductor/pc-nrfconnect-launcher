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
