/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { RootErrorDialog } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { inMain } from '../../../ipc/apps';
import { createLocalTestApp } from '../../../test/testFixtures';
import testrenderer, { preparedStore } from '../../../test/testrenderer';
import { getAllApps } from '../apps/appsSlice';
import DropZoneForLocalApps from './DropZoneForLocalApps';

const { appExists, failureReadingFile, successfulInstall } =
    jest.requireActual('../../../ipc/apps');

jest.mock('../../../ipc/apps');

jest.mock('electron', () => ({
    webUtils: {
        getPathForFile: jest.fn((file: { path: string }) => file.path), // treat "file" as "path" for the tests
    },
}));

const installedApp = createLocalTestApp('anApp');
const anotherInstalledApp = createLocalTestApp('anotherApp');

const drop = (paths: string[]) => {
    fireEvent.drop(screen.getByTestId('app-install-drop-zone'), {
        dataTransfer: {
            files: paths.map(path => ({ path })),
        },
    });
};

describe('DropZoneForLocalApps', () => {
    it('installs the dropped file', async () => {
        jest.mocked(inMain.installLocalApp)
            .mockClear()
            .mockResolvedValue(successfulInstall(installedApp));

        const path = 'testapp-1.2.3.tgz';
        const store = preparedStore();

        testrenderer(<DropZoneForLocalApps />, store);

        drop([path]);

        expect(inMain.installLocalApp).toHaveBeenCalledWith(path);

        await waitFor(() =>
            expect(getAllApps(store.getState())).toContain(installedApp),
        );
    });

    it('installs nothing when dropping no file (e.g. only text)', () => {
        jest.mocked(inMain.installLocalApp).mockClear();

        testrenderer(<DropZoneForLocalApps />);

        drop([]);

        expect(inMain.installLocalApp).not.toHaveBeenCalled();
    });

    it('installs all files that are dropped', async () => {
        jest.mocked(inMain.installLocalApp)
            .mockClear()
            .mockResolvedValueOnce(successfulInstall(installedApp))
            .mockResolvedValueOnce(successfulInstall(anotherInstalledApp));

        const path1 = 'one-testapp-1.2.3.tgz';
        const path2 = 'another-testapp-1.2.3.tgz';
        const store = preparedStore();

        testrenderer(<DropZoneForLocalApps />, store);

        drop([path1, path2]);

        await waitFor(() => {
            expect(inMain.installLocalApp).toHaveBeenCalledTimes(2);
        });
        await waitFor(() => {
            expect(getAllApps(store.getState())).toEqual(
                expect.arrayContaining([installedApp, anotherInstalledApp]),
            );
        });
    });

    it('shows an error if the archive cannot be unpacked', async () => {
        const errorMessage = 'Could not unpack the archive';
        jest.mocked(inMain.installLocalApp)
            .mockClear()
            .mockResolvedValue(failureReadingFile(errorMessage));

        testrenderer(
            <>
                <DropZoneForLocalApps />
                <RootErrorDialog />
            </>,
        );

        drop(['testapp-1.2.3.tgz']);

        await screen.findByText(errorMessage);
    });

    it('shows an error if the app exists', async () => {
        const path = 'testapp-1.2.3.tgz';
        jest.mocked(inMain.installLocalApp)
            .mockClear()
            .mockResolvedValue(appExists('testapp', path));

        testrenderer(
            <>
                <DropZoneForLocalApps />
                <RootErrorDialog />
            </>,
        );

        drop([path]);

        // The real string we search for is 'A local app `testapp` already exists. Overwrite it with the content of `testapp-1.2.3.tgz`?'
        // I did not manage to write a single check for that, because `testapp` and `testapp-1.2.3.tgz` are in sub elements. ¯\_(ツ)_/¯
        await screen.findByText(
            'A local app already exists. Overwrite it with the content of ?',
        );
        await screen.findByText('testapp');
        await screen.findByText('testapp-1.2.3.tgz');
    });

    describe('information about drop', () => {
        const information =
            'Drop app package files to install them as local apps';

        it('is displayed while dragging', () => {
            testrenderer(<DropZoneForLocalApps />);

            fireEvent.dragEnter(screen.getByTestId('app-install-drop-zone'));

            expect(screen.getByText(information)).toBeVisible();
        });

        it('is hidden again after dropping anything', () => {
            testrenderer(<DropZoneForLocalApps />);

            fireEvent.dragEnter(screen.getByTestId('app-install-drop-zone'));
            drop([]);

            expect(screen.getByText(information)).not.toBeVisible();
        });

        it('is hidden after leaving again', () => {
            testrenderer(
                <DropZoneForLocalApps>
                    <div data-testid="some-child" />
                </DropZoneForLocalApps>,
            );

            fireEvent.dragEnter(screen.getByTestId('app-install-drop-zone'));
            fireEvent.dragLeave(screen.getByTestId('app-install-drop-zone'));

            expect(screen.getByText(information)).not.toBeVisible();
        });

        it('is still shown if not all elements were left', () => {
            testrenderer(
                <DropZoneForLocalApps>
                    <div data-testid="some-child" />
                </DropZoneForLocalApps>,
            );

            fireEvent.dragEnter(screen.getByTestId('app-install-drop-zone'));
            fireEvent.dragEnter(screen.getByTestId('some-child'));
            fireEvent.dragLeave(screen.getByTestId('some-child'));

            expect(screen.getByText(information)).toBeVisible();
        });
    });
});
