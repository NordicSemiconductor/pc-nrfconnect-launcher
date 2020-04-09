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

const fixtureDir = path.resolve(__dirname, './fixtures/one-local-app-to-be-extracted');
const appsRootDir = path.join(fixtureDir, '.nrfconnect-apps');
const electronArgs = [
    `--apps-root-dir=${appsRootDir}`,
    '--skip-update-apps',
];
const appName = 'pc-nrfconnect-foo';
const appArchiveFile = `${appName}-1.2.3.tgz`;

let electronApp;

function copyArchiveToLocal() {
    const sourceFile = path.join(fixtureDir, appArchiveFile);
    const destFile = path.join(appsRootDir, 'local', appArchiveFile);
    fs.writeFileSync(destFile, fs.readFileSync(sourceFile));
}

function removeAppDirFromLocal() {
    rimraf.sync(path.join(appsRootDir, 'local', appName));
}

describe('one local app to be extracted', () => {
    beforeEach(() => {
        copyArchiveToLocal();
        return startElectronApp(electronArgs)
            .then(startedApp => {
                electronApp = startedApp;
            });
    });

    afterEach(() => (
        stopElectronApp(electronApp)
            .then(() => {
                removeAppDirFromLocal();
            })
    ));

    it('should extract archive and show app name in the launcher app list', () => (
        electronApp.client.windowByIndex(0)
            .waitForVisible('.list-group-item')
            .getText('.list-group-item .h8')
            .then(text => expect(text).toEqual('Foo App'))
    ));

    it('should remove archive file from apps local directory after extracting', () => (
        electronApp.client.windowByIndex(0)
            .waitForVisible('.list-group-item')
            .then(() => {
                const exists = fs.existsSync(path.join(appsRootDir, 'local', appArchiveFile));
                expect(exists).toEqual(false);
            })
    ));
});
