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

const anotherInstalledApp: LocalApp = {
    name: 'another local',
    source: LOCAL,
    displayName: 'Local App',
    description: 'Another local app',
    isInstalled: true,
    isDownloadable: false,

    currentVersion: '2.0.0',

    engineVersion: '6.1.0',
    path: '',
    iconPath: '',
    shortcutIconPath: '',
};

describe('DropZoneForLocalApps', () => {
    beforeEach(() => {
        jest.mocked(installLocalApp)
            .mockClear()
            .mockResolvedValueOnce(installedApp)
            .mockResolvedValueOnce(anotherInstalledApp);
    });

    it('installs the dropped file', async () => {
        const path = 'testapp-1.2.3.tgz';
        const store = preparedStore();

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

    it('installs nothing when dropping no file (e.g. only text)', () => {
        testrenderer(<DropZoneForLocalApps />);

        fireEvent.drop(screen.getByTestId('app-install-drop-zone'), {
            dataTransfer: { files: [] },
        });

        expect(installLocalApp).not.toHaveBeenCalled();
    });

    it('installs all files that are dropped', async () => {
        const path1 = 'one-testapp-1.2.3.tgz';
        const path2 = 'another-testapp-1.2.3.tgz';
        const store = preparedStore();

        testrenderer(<DropZoneForLocalApps />, store);

        fireEvent.drop(screen.getByTestId('app-install-drop-zone'), {
            dataTransfer: {
                files: [{ path: path1 }, { path: path2 }],
            },
        });

        await waitFor(() => {
            expect(installLocalApp).toHaveBeenCalledTimes(2);
        });
        await waitFor(() => {
            expect(getAllApps(store.getState())).toEqual(
                expect.arrayContaining([installedApp, anotherInstalledApp])
            );
        });
    });
});
