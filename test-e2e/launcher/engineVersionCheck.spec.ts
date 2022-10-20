/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ElectronApplication, expect, Page } from '@playwright/test';
// import { test } from 'pc-nrfconnect-shared/tests-e2e';
import { test } from './baseFixtures';
import fs from 'fs';
import path from 'path';

import { launchFirstAppFromPage } from '../launchFirstApp';
import { setup, teardown } from '../setupTestApp';

const oldPath = path.join(__dirname, '../../', 'README.md');
const newPath = path.join(__dirname, '../../', 'README.md.not');

test.describe(
    'checks the version of the engine against what the app declares',
    () => {
        test.describe('a downloadable app that is only available', () => {
            const appsRootDir =
                'launcher/fixtures/one-downloadable-app-not-installed/.nrfconnect-apps';
            let app: ElectronApplication;
            let page: Page;
            test.beforeAll(async () => {
                app = await setup({
                    appsRootDir,
                });

                page = await app.firstWindow();
            });

            test.afterAll(async () => {
                await teardown({
                    app,
                    appsRootDir,
                });
            });

            test('shows no warning in the app list', async () => {
                await page.waitForSelector('.list-group-item');

                await expect(
                    page.$(
                        '[title*="The app does not specify which nRF Connect for Desktop versions it supports"]'
                    )
                ).resolves.toBeNull();
                await expect(
                    page.$(
                        '[title*="The app only supports nRF Connect for Desktop"]'
                    )
                ).resolves.toBeNull();
            });
        });

        test.describe('local app with unsupported engine', () => {
            const appsRootDir =
                'launcher/fixtures/one-local-app-unsupported-engine/.nrfconnect-apps';
            let app: ElectronApplication;
            let page: Page;
            test.beforeAll(async () => {
                fs.renameSync(oldPath, newPath);
                app = await setup({
                    appsRootDir,
                });

                page = await app.firstWindow();
            });

            test.afterAll(async () => {
                await teardown({
                    app,
                    appsRootDir,
                });
                fs.renameSync(newPath, oldPath);
            });

            test('shows a warning in the app list', async () => {
                await page.waitForSelector('.list-group-item');
                await expect(
                    page.$(
                        '[title*="The app only supports nRF Connect for Desktop 1.x"]'
                    )
                ).resolves.not.toBeNull();
            });

            test('shows a warning dialog when launching the app', async () => {
                await launchFirstAppFromPage(page);
                await expect(
                    page.$('button:has-text("Launch anyway")')
                ).resolves.not.toBeNull();
            });

            test('does not launch the app when selecting "Cancel"', async () => {
                await page.click('button:has-text("Cancel")');
                await page.waitForSelector('button:has-text("Cancel")', {
                    state: 'detached',
                });
            });

            test('launches the app regardless when selecting "Launch anyway"', async () => {
                await launchFirstAppFromPage(page);
                await page.click('button:has-text("Launch anyway")');
                await page.waitForSelector('button:has-text("Cancel")', {
                    state: 'detached',
                });
            });
        });

        test.describe('one local app without engine definition', () => {
            const appsRootDir =
                'launcher/fixtures/one-local-app-without-engine/.nrfconnect-apps';
            let app: ElectronApplication;
            let page: Page;
            test.beforeAll(async () => {
                fs.renameSync(oldPath, newPath);
                app = await setup({
                    appsRootDir,
                });

                page = await app.firstWindow();
            });

            test.afterAll(async () => {
                await teardown({
                    app,
                    appsRootDir,
                });
                fs.renameSync(newPath, oldPath);
            });

            test('shows a warning in the app list', async () => {
                await page.waitForSelector('.list-group-item');

                await expect(
                    page.$(
                        'span[title*="The app does not specify which nRF Connect for Desktop versions it supports"]'
                    )
                ).resolves.not.toBeNull();
            });

            test('shows a warning dialog when launching the app', async () => {
                await launchFirstAppFromPage(page);
                await expect(
                    page.$('button:has-text("Launch anyway")')
                ).resolves.not.toBeNull();
            });

            test('does not launch the app when selecting "Cancel"', async () => {
                await page.click('button:has-text("Cancel")');
                await page.waitForSelector('button:has-text("Cancel")', {
                    state: 'detached',
                });
            });

            test('launches the app regardless when selecting "Launch anyway"', async () => {
                await launchFirstAppFromPage(page);
                await page.click('button:has-text("Launch anyway")');
                await page.waitForSelector('button:has-text("Cancel")', {
                    state: 'detached',
                });
            });
        });
    }
);
