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

/* eslint-disable import/first */

jest.mock('electron', () => ({
    remote: { require: () => {} },
}));


import { Record } from 'immutable';
// import * as actions from '../desktopShortcutActions';
const actions = require('../desktopShortcutActions');
actions.generateShortcutContent = jest.fn();


// const appTemplate = Record({
//     name: 'pc-nrfconnect-ble',
//     displayName: 'Bluetooth low energy',
//     description: 'General tool for development and testing with Bluetooth low energy',
//     homepage: 'https://github.com/NordicSemiconductor/pc-nrfconnect-ble',
//     currentVersion: '2.0.0',
//     latestVersion: '2.0.1',
//     engineVersion: '2.x',
//     path: 'C:\\Users\\chfa\\.nrfconnect-apps\\node_modules\\pc-nrfconnect-ble',
//     iconPath: 'C:\\Users\\chfa\\.nrfconnect-apps\\node_modules\\pc-nrfconnect-ble\\icon.png',
//     isOfficial: true,
//     isSupportedEngine: true,
// });

describe('generateShortcutContent', () => {
    const app = Record({
        name: '',
        displayName: '',
        description: 'General tool for development and testing with Bluetooth low energy',
        homepage: 'https://github.com/NordicSemiconductor/pc-nrfconnect-ble',
        currentVersion: '2.0.0',
        latestVersion: '2.0.1',
        engineVersion: '2.x',
        path: 'C:\\Users\\chfa\\.nrfconnect-apps\\node_modules\\pc-nrfconnect-ble',
        iconPath: 'C:\\Users\\chfa\\.nrfconnect-apps\\node_modules\\pc-nrfconnect-ble\\icon.png',
        isOfficial: true,
        isSupportedEngine: true,
    });
    it('should return null if both name and displayName are empty', () => {
        expect(actions.generateShortcutContent(app)).toEqual(null);
    });
});
