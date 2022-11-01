/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { installLocalApp, LocalApp } from '../../ipc/apps';
import { LOCAL } from '../../ipc/sources';
import testrenderer, { preparedStore } from '../../testrenderer';
import { getAllApps } from '../features/apps/appsSlice';
import DropZoneForLocalApps from './DropZoneForLocalApps';

jest.mock('../../ipc/apps');

const installedApp: LocalApp = {
    name: 'local',
    source: LOCAL,
    displayName: 'Local App',
    description: 'An local app',
    isInstalled: true,
    isDownloadable: false,

    currentVersion: '2.0.0',

    engineVersion: '6.1.0',
    path: '',
    iconPath: '',
    shortcutIconPath: '',
};

describe('DropZoneForLocalApps', () => {
    it('installs the dropped file', async () => {
        const path = 'testapp-1.2.3.tgz';
        const store = preparedStore();
        (
            installLocalApp as jest.MockedFunction<typeof installLocalApp>
        ).mockResolvedValueOnce(installedApp);

        testrenderer(<DropZoneForLocalApps />, store);

        fireEvent.drop(screen.getByTestId('app-install-drop-zone'), {
            dataTransfer: {
                files: [{ path }],
            },
        });

        expect(installLocalApp).toHaveBeenCalledWith(path);

        await waitFor(() =>
            expect(getAllApps(store.getState())).toContain(installedApp)
        );
    });
});
