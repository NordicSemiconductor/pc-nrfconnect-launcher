/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import setupTestApp from '../setupTestApp';

describe('an app', () => {
    const app = setupTestApp({
        appsRootDir: 'launcher/fixtures/one-local-app/.nrfconnect-apps',
        openLocalApp: 'pc-nrfconnect-test',
    });

    it('initially does not show list of main menu items', async () => {
        await expect(app.client.isVisible('#main-menu-list')).resolves.toBe(
            false
        );
    });

    it('shows "Launch other app" in main menu', async () => {
        await app.client.waitForVisible('#main-menu').click('#main-menu');
        await expect(
            app.client.isVisible('#main-menu-list a[title*="Launch other app"]')
        ).resolves.toBe(true);
    });

    it('shows port list in port selector', async () => {
        await app.client
            .waitForVisible('#serial-port-selector')
            .click('#serial-port-selector');
        await expect(
            app.client.isVisible('#serial-port-selector .dropdown-menu')
        ).resolves.toBe(true);
    });
});
