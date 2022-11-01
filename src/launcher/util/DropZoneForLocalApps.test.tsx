/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { ErrorDialog } from 'pc-nrfconnect-shared';

import type { LocalApp } from '../../ipc/apps';
import { installLocalApp } from '../../ipc/apps';
import { LOCAL } from '../../ipc/sources';
import testrenderer, { preparedStore } from '../../testrenderer';
import { getAllApps } from '../features/apps/appsSlice';
import DropZoneForLocalApps from './DropZoneForLocalApps';

const { appExists, failureReadingFile, successfulInstall } =
    jest.requireActual('../../ipc/apps');

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
    it('installs the dropped file', async () => {
        jest.mocked(installLocalApp)
            .mockClear()
            .mockResolvedValue(successfulInstall(installedApp));

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
        jest.mocked(installLocalApp).mockClear();

        testrenderer(<DropZoneForLocalApps />);

        fireEvent.drop(screen.getByTestId('app-install-drop-zone'), {
            dataTransfer: { files: [] },
        });

        expect(installLocalApp).not.toHaveBeenCalled();
    });

    it('installs all files that are dropped', async () => {
        jest.mocked(installLocalApp)
            .mockClear()
            .mockResolvedValueOnce(successfulInstall(installedApp))
            .mockResolvedValueOnce(successfulInstall(anotherInstalledApp));

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

    it('shows an error if the archive cannot be unpacked', async () => {
        const errorMessage = 'Could not unpack the archive';
        jest.mocked(installLocalApp)
            .mockClear()
            .mockResolvedValue(failureReadingFile(errorMessage));

        testrenderer(
            <>
                <DropZoneForLocalApps />
                <ErrorDialog />
            </>
        );

        fireEvent.drop(screen.getByTestId('app-install-drop-zone'), {
            dataTransfer: {
                files: [{ path: 'testapp-1.2.3.tgz' }],
            },
        });

        await screen.findByText(errorMessage);
    });

    it('shows an error if the app exists', async () => {
        const path = 'testapp-1.2.3.tgz';
        jest.mocked(installLocalApp)
            .mockClear()
            .mockResolvedValue(appExists('testapp', path));

        testrenderer(
            <>
                <DropZoneForLocalApps />
                <ErrorDialog />
            </>
        );

        fireEvent.drop(screen.getByTestId('app-install-drop-zone'), {
            dataTransfer: {
                files: [{ path }],
            },
        });

        // The real string we search for is 'A local app `testapp` already exists. Overwrite it with the content of `testapp-1.2.3.tgz`?'
        await screen.findByText(
            'A local app already exists. Overwrite it with the content of ?'
        );
        await screen.findByText('testapp');
        await screen.findByText('testapp-1.2.3.tgz');
    });
});
