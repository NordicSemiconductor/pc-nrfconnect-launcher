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

import setupTestApp from '../setupTestApp';
import launchFirstApp from '../launchFirstApp';

import {
    checkAppListContains,
    checkHasNoLaunchButton,
    checkHasNoRemoveButton,
    checkHasRemoveButton,
    checkShowsAppUpdate,
    checkHasInstallButton,
    checkHasNoInstallButton,
    checkShowsNoAppUpdate,
    checkTitleOfSecondWindow,
} from '../assertions';

describe('the list of all apps', () => {
    describe('has an official app that is available', () => {
        const app = setupTestApp({
            appsRootDir:
                'launcher/fixtures/one-official-app-not-installed/.nrfconnect-apps',
        });

        it('is in the launcher app list', () =>
            checkAppListContains(app, 'Test App'));

        it('has no launch button', () =>
            checkHasNoLaunchButton(app, 'Test App'));

        it('has install button', () => checkHasInstallButton(app, 'Test App'));

        it('has no remove button', () =>
            checkHasNoRemoveButton(app, 'Test App'));

        it('shows no available upgrade', () =>
            checkShowsNoAppUpdate(app, 'Test App'));
    });

    describe('has an official apps that is installed', () => {
        const app = setupTestApp({
            appsRootDir:
                'launcher/fixtures/one-official-app-installed/.nrfconnect-apps',
        });

        it('is in the launcher app list', () =>
            checkAppListContains(app, 'Test App'));

        it('has no install button', () =>
            checkHasNoInstallButton(app, 'Test App'));

        it('launches the app', async () => {
            await launchFirstApp(app);
            await checkTitleOfSecondWindow(app, 'Test App');
        });

        it('has a remove button', () => checkHasRemoveButton(app, 'Test App'));

        it('shows no available upgrade', () =>
            checkShowsNoAppUpdate(app, 'Test App'));
    });

    describe('has an official apps that is upgradable', () => {
        const app = setupTestApp({
            appsRootDir:
                'launcher/fixtures/one-official-app-upgradable/.nrfconnect-apps',
        });

        it('is in the launcher app list', () =>
            checkAppListContains(app, 'Test App'));

        it('has no install button', () =>
            checkHasNoInstallButton(app, 'Test App'));

        it('launches the app', async () => {
            await launchFirstApp(app);
            await checkTitleOfSecondWindow(app, 'Test App');
        });

        it('has a remove button', () => checkHasRemoveButton(app, 'Test App'));

        it('shows an available upgrade', () =>
            checkShowsAppUpdate(app, 'Test App', 'v1.2.4'));
    });

    describe('has a local app', () => {
        const app = setupTestApp({
            appsRootDir: 'launcher/fixtures/one-local-app/.nrfconnect-apps',
        });

        it('is in the launcher app list', () =>
            checkAppListContains(app, 'Test App'));

        it('launches the app', async () => {
            await launchFirstApp(app);
            await checkTitleOfSecondWindow(app, 'Test App');
        });

        it('has no install button', () =>
            checkHasNoInstallButton(app, 'Test App'));

        it('has no remove button', () =>
            checkHasNoRemoveButton(app, 'Test App'));

        it('shows no available upgrade', () =>
            checkShowsNoAppUpdate(app, 'Test App'));
    });
});
