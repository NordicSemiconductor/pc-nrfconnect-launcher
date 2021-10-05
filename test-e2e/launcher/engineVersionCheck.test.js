/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import launchFirstApp from '../launchFirstApp';
import setupTestApp from '../setupTestApp';

describe('checks the version of the engine against what the app declares', () => {
    describe('an official app that is only available', () => {
        const app = setupTestApp({
            appsRootDir:
                'launcher/fixtures/one-official-app-not-installed/.nrfconnect-apps',
        });

        it('shows no warning in the app list', async () => {
            await app.client.waitForVisible('.list-group-item');

            await expect(
                app.client.isVisible(
                    'span[title="The app does not specify which nRF Connect version(s) it supports'
                )
            ).resolves.toBe(false);
            await expect(
                app.client.isVisible(
                    'span[title*="The app only supports nRF Connect'
                )
            ).resolves.toBe(false);
        });
    });

    describe('local app with unsupported engine', () => {
        const app = setupTestApp({
            appsRootDir:
                'launcher/fixtures/one-local-app-unsupported-engine/.nrfconnect-apps',
        });

        it('shows a warning in the app list', () =>
            app.client.waitForVisible(
                'span[title*="The app only supports nRF Connect 1.x'
            ));

        it('shows a warning dialog when launching the app', async () => {
            await launchFirstApp(app, false);

            await app.client.waitForVisible('.modal-dialog');
        });
    });

    describe('one local app without engine definition', () => {
        const app = setupTestApp({
            appsRootDir:
                'launcher/fixtures/one-local-app-without-engine/.nrfconnect-apps',
        });

        it('shows a warning in the app list', () =>
            app.client.waitForVisible(
                'span[title="The app does not specify which nRF Connect version(s) it supports'
            ));

        it('shows a warning dialog when launching the app', async () => {
            await launchFirstApp(app, false);

            await app.client.waitForVisible('.modal-dialog');
        });
    });
});
