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
import setupTestApp from '../setupTestApp';
import { checkTitleOfWindow } from '../assertions';
import { version } from '../../package.json';

describe('basic behaviour of the launcher', () => {
    const app = setupTestApp({
        appsRootDir: 'launcher/fixtures/one-local-app/.nrfconnect-apps',
    });

    it('shows package.json version in launcher window title', () =>
        checkTitleOfWindow(app, version));
});

describe('automatic update check', () => {
    describe('When enabled', () => {
        const appsRootDir =
            'launcher/fixtures/check-for-updates-at-startup-enabled/.nrfconnect-apps';
        const settingsJsonPath =
            'launcher/fixtures/check-for-updates-at-startup-enabled/settings.json';

        const app = setupTestApp({
            appsRootDir,
            settingsJsonPath,
            removeAppsRootDirAfterwards: true,
            skipUpdateApps: false,
        });

        it('populates apps.json in .nrfconnect-apps', async () => {
            await app.client.waitForVisible('.list-group-item');

            const appsJsonFile = path.join(
                __dirname,
                '..',
                appsRootDir,
                'apps.json'
            );
            // eslint-disable-next-line import/no-dynamic-require, global-require
            const appsJson = require(appsJsonFile);
            const appNames = Object.keys(appsJson);

            expect(appNames.length).toBeGreaterThan(0);
        });
    });

    describe('When disabled', () => {
        const appsRootDir =
            'launcher/fixtures/check-for-updates-at-startup-disabled/.nrfconnect-apps';
        const settingsJsonPath =
            'launcher/fixtures/check-for-updates-at-startup-disabled/settings.json';

        const app = setupTestApp({
            appsRootDir,
            settingsJsonPath,
            removeAppsRootDirAfterwards: true,
            skipUpdateApps: false,
        });

        it('populates not apps.json in .nrfconnect-apps', async () => {
            await app.client.waitForVisible('#launcher-tabpane-apps');

            const appsJsonFile = path.join(
                __dirname,
                '..',
                appsRootDir,
                'apps.json'
            );
            // eslint-disable-next-line import/no-dynamic-require, global-require
            const appsJson = require(appsJsonFile);

            expect(appsJson).toEqual({});
        });
    });
});

describe('showing apps available on the server', () => {
    const app = setupTestApp({
        appsRootDir: 'launcher/fixtures/app-installation/.nrfconnect-apps',
        removeAppsRootDirAfterwards: true,
        skipUpdateApps: false,
    });

    it('shows apps available on the server', () =>
        app.client.waitForVisible('button[title*="Install"]'));
});
