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
import setupTestApp from '../setupTestApp';
import { checkAppListContains } from '../assertions';

describe('app installation', () => {
    describe('online from the server', () => {
        const app = setupTestApp({
            appsRootDir: 'launcher/fixtures/app-installation/.nrfconnect-apps',
            removeAppsRootDirAfterwards: true,
            skipUpdateApps: false,
        });

        it('installs and removes an online available app', () =>
            app.client
                .waitForVisible('button[title*="Install"]')
                .click('button[title*="Install"]')
                .click('.list-group-item button[aria-haspopup="true"]')
                .waitForVisible('a[title*="Remove"]')
                .click('a[title*="Remove"]')
                .waitForVisible('button[title*="Install"]'));
    });

    describe('offline from an app archive file', () => {
        const fixtureDir = 'fixtures/one-local-app-to-be-extracted';
        const localDir = path.join(
            __dirname,
            fixtureDir,
            '.nrfconnect-apps',
            'local'
        );
        const appName = 'pc-nrfconnect-foo';
        const appArchiveFile = `${appName}-1.2.3.tgz`;

        const removeAppDirFromLocal = () => {
            rimraf.sync(path.join(localDir, appName));
        };

        const copyArchiveToLocal = () => {
            const sourceFile = path.join(__dirname, fixtureDir, appArchiveFile);
            const destFile = path.join(localDir, appArchiveFile);
            fs.copyFileSync(sourceFile, destFile);
        };

        const app = setupTestApp({
            appsRootDir: path.join('launcher', fixtureDir, '.nrfconnect-apps'),
            additionalBeforeEach: copyArchiveToLocal,
            additionalAfterEach: removeAppDirFromLocal,
        });

        it('shows the app name in the launcher app list', () =>
            checkAppListContains(app, 'Foo App'));

        it('removes the archive file', async () => {
            await app.client.waitForVisible('.list-group-item');

            const exists = fs.existsSync(path.join(localDir, appArchiveFile));
            expect(exists).toEqual(false);
        });
    });
});
