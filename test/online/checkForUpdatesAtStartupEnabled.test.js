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

import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import { startElectronApp, stopElectronApp } from '../setup';

let electronApp;

const fixtureDir = path.resolve(__dirname, './fixtures/check-for-updates-at-startup-enabled');
const appsRootDir = path.join(fixtureDir, '.nrfconnect-apps');
const electronArgs = [
    `--apps-root-dir=${appsRootDir}`,
    `--settings-json-path=${path.join(fixtureDir, 'settings.json')}`,
];

function removeAppsRootDir() {
    rimraf.sync(appsRootDir);
}

describe('when checking for updates at startup is enabled', () => {
    beforeEach(() => (
        startElectronApp(electronArgs)
            .then(startedApp => {
                electronApp = startedApp;
            })
    ));

    afterEach(() => (
        stopElectronApp(electronApp)
            .then(() => {
                // The apps root directory is created when starting
                // the application. Cleaning up.
                removeAppsRootDir();
            })
    ));

    it('should populate apps.json in .nrfconnect-apps', () => (
        electronApp.client.windowByIndex(0)
            .waitForVisible('h4')
            .then(() => {
                const appsJsonString = fs.readFileSync(path.join(appsRootDir, 'apps.json'), 'utf8');
                const appsJsonObj = JSON.parse(appsJsonString);
                const appNames = Object.keys(appsJsonObj);
                expect(appNames.length).toBeGreaterThan(0);
            })
    ));

    it('should show checking for updates as enabled in the Settings screen', () => (
        electronApp.client.windowByIndex(0)
            .click('button[title*="Settings"]')
            .waitForVisible('.core-settings-update-check-controls')
            .getAttribute('.core-settings-update-check-controls input[type="checkbox"]', 'checked')
            .then(checked => expect(checked).toEqual('true'))
    ));
});
