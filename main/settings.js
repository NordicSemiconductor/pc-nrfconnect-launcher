/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

const app = require('electron').app;
const fs = require('fs');
const path = require('path');

let data = null;

const filePath = path.join(app.getPath('userData'), 'settings.json');

function parseSettingsFile() {
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
    const settings = parseSettingsFile();
    if (settings && typeof settings === 'object') {
        data = settings;
    } else {
        data = {};
    }
}

function save() {
    fs.writeFileSync(filePath, JSON.stringify(data));
}

exports.set = (key, value) => {
    load();
    data[key] = value;
    save();
};

exports.get = key => {
    load();
    let value = null;

    if (key in data) {
        value = data[key];
    }

    return value;
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
