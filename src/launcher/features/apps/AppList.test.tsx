/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { LOCAL } from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/sources';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
    createDownloadableTestApp,
    createLocalTestApp,
    createUninstalledTestApp,
} from '../../../test/testFixtures';
import render, { preparedStore } from '../../../test/testrenderer';
import { hideSource } from '../filter/filterSlice';
import { setCheckForUpdatesAtStartup } from '../settings/settingsSlice';
import AppList from './AppList';
import {
    checkCompatibilityThenLaunch,
    installDownloadableApp,
    removeDownloadableApp,
} from './appsEffects';
import {
    addDownloadableApps,
    installDownloadableAppStarted,
    removeDownloadableAppStarted,
    setAllLocalApps,
    updateDownloadableAppStarted,
} from './appsSlice';

// Do not render react-bootstrap components in tests
jest.mock('react-bootstrap', () => ({
    Modal: 'Modal',
    Button: 'Button',
    ModalHeader: 'ModalHeader',
    ModalFooter: 'ModalFooter',
    ModalBody: 'ModalBody',
    ModalTitle: 'ModalTitle',
}));

jest.mock('../../features/filter/AppFilterBar', () => 'div');
jest.mock('../../features/releaseNotes/ReleaseNotesDialog', () => 'div');
jest.mock('@nordicsemiconductor/pc-nrfconnect-shared', () => ({
    ...jest.requireActual('@nordicsemiconductor/pc-nrfconnect-shared'),
    launcherConfig: () => ({
        launcherVersion: '6.1.0',
    }),
}));

jest.mock('../../features/apps/appsEffects');

const localApp = createLocalTestApp('dummy', { engineVersion: '6.1.0' });

const updatableApp = createDownloadableTestApp('updatable', {
    currentVersion: '1.2.3',
    latestVersion: '1.2.4',
    engineVersion: '6.1.0',
});

const uninstalledApp = createUninstalledTestApp('uninstalled');

const installedApp = createDownloadableTestApp('installed', {
    engineVersion: '6.1.0',
});

const mockThunk = (thunkToMock: jest.MockableFunction) => {
    jest.mocked(thunkToMock).mockReturnValue({
        type: 'an action',
    });
};

describe('AppList', () => {
    it('should render without any apps initially empty', () => {
        expect(render(<AppList />).baseElement).toMatchSnapshot();
    });

    it('should render a message without any apps after some time', () => {
        jest.useFakeTimers();

        const view = render(<AppList />);

        act(() => {
            jest.runAllTimers();
        });

        expect(view.baseElement).toMatchSnapshot();

        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('should render without any apps and disabled update check', () => {
        expect(
            render(<AppList />, [setCheckForUpdatesAtStartup(false)])
                .baseElement,
        ).toMatchSnapshot();
    });

    it('should render with all apps filtered out', () => {
        expect(
            render(<AppList />, [
                setAllLocalApps([localApp]),
                hideSource(LOCAL),
            ]).baseElement,
        ).toMatchSnapshot();
    });

    it('should render local, not-installed, installed, and updatable apps', () => {
        expect(
            render(<AppList />, [
                addDownloadableApps([
                    uninstalledApp,
                    installedApp,
                    updatableApp,
                ]),
                setAllLocalApps([localApp]),
            ]).baseElement,
        ).toMatchSnapshot();
    });

    it('should disable buttons and display "Installing..." button text while installing an app', () => {
        expect(
            render(<AppList />, [
                addDownloadableApps([uninstalledApp]),
                installDownloadableAppStarted(uninstalledApp),
            ]).baseElement,
        ).toMatchSnapshot();
    });

    it('should disable buttons while removing an app', () => {
        expect(
            render(<AppList />, [
                addDownloadableApps([installedApp]),
                removeDownloadableAppStarted(installedApp),
            ]).baseElement,
        ).toMatchSnapshot();
    });

    it('should disable buttons and display "Updating..." while updating an app', () => {
        expect(
            render(<AppList />, [
                addDownloadableApps([updatableApp]),
                updateDownloadableAppStarted(updatableApp),
            ]).baseElement,
        ).toMatchSnapshot();
    });

    it('should invoke installDownloadableApp with app name and source when install button is clicked', async () => {
        const user = userEvent.setup();
        mockThunk(installDownloadableApp);

        render(
            <Provider
                store={preparedStore([addDownloadableApps([uninstalledApp])])}
            >
                <AppList />
            </Provider>,
        );
        await user.click(
            screen.getByTitle(`Install ${uninstalledApp.displayName}`),
        );

        expect(installDownloadableApp).toHaveBeenCalledWith(
            expect.objectContaining(uninstalledApp),
        );
    });

    it('should invoke removeDownloadableApp with app name and source when remove button is clicked', async () => {
        mockThunk(removeDownloadableApp);
        const user = userEvent.setup();

        const { container } = render(
            <Provider
                store={preparedStore([addDownloadableApps([installedApp])])}
            >
                <AppList />
            </Provider>,
        );

        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        const el = container.getElementsByClassName('dropdown-toggle').item(0);
        await user.click(el!);
        await user.click(
            screen.getByTitle(`Remove ${installedApp.displayName}`),
        );

        expect(removeDownloadableApp).toHaveBeenCalledWith(
            expect.objectContaining(installedApp),
            '4.5.6',
        );
    });

    it('should invoke checkEngineAndLaunch with given app item when Open is clicked', async () => {
        mockThunk(checkCompatibilityThenLaunch);
        const user = userEvent.setup();

        render(
            <Provider
                store={preparedStore([addDownloadableApps([installedApp])])}
            >
                <AppList />
            </Provider>,
        );

        await user.click(screen.getByTitle(`Open ${installedApp.displayName}`));

        expect(checkCompatibilityThenLaunch).toHaveBeenCalledWith(
            expect.objectContaining(installedApp),
        );
    });
});
