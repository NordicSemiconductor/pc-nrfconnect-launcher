/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { expect, test } from '@playwright/test';

import launchFirstApp from '../launchFirstApp';
import setupTestApp from '../setupTestApp';

test.describe(
    'checks the version of the engine against what the app declares',
    () => {
        test.describe('an official app that is only available', () => {
            const app = setupTestApp({
                appsRootDir:
                    'launcher/fixtures/one-official-app-not-installed/.nrfconnect-apps',
            });

            test('shows no warning in the app list', async () => {
                await app.waitForVisible('.list-group-item');

                await expect(
                    app.isVisible(
                        'span[title="The app does not specify which nRF Connect version(s) it supports'
                    )
                ).resolves.toBe(false);
                await expect(
                    app.isVisible(
                        'span[title*="The app only supports nRF Connect'
                    )
                ).resolves.toBe(false);
            });
        });

        test.describe('local app with unsupported engine', () => {
            const app = setupTestApp({
                appsRootDir:
                    'launcher/fixtures/one-local-app-unsupported-engine/.nrfconnect-apps',
            });

            test('shows a warning in the app list', () =>
                app.waitForVisible(
                    'span[title*="The app only supports nRF Connect 1.x'
                ));

            test('shows a warning dialog when launching the app', async () => {
                await launchFirstApp(app, false);

                await app.waitForVisible('.modal-dialog');
            });
        });

        test.describe('one local app without engine definition', () => {
            const app = setupTestApp({
                appsRootDir:
                    'launcher/fixtures/one-local-app-without-engine/.nrfconnect-apps',
            });

            test('shows a warning in the app list', () =>
                app.waitForVisible(
                    'span[title="The app does not specify which nRF Connect version(s) it supports'
                ));

            test('shows a warning dialog when launching the app', async () => {
                await launchFirstApp(app, false);

                await app.waitForVisible('.modal-dialog');
            });
        });
    }
);
