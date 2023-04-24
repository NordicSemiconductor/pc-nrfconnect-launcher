/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import {
    createDownloadableTestApp,
    createLocalTestApp,
    createUninstalledTestApp,
} from '../../../test/testFixtures';
import render, { preparedStore } from '../../../test/testrenderer';
import AppList from './AppList';
import {
    checkEngineAndLaunch,
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
jest.mock('../../util/mainConfig', () => () => ({ version: '6.1.0' }));

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
    it('should render without any apps', () => {
        expect(render(<AppList />).baseElement).toMatchSnapshot();
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
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should disable buttons and display "Installing..." button text while installing an app', () => {
        expect(
            render(<AppList />, [
                addDownloadableApps([uninstalledApp]),
                installDownloadableAppStarted(uninstalledApp),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should disable buttons while removing an app', () => {
        expect(
            render(<AppList />, [
                addDownloadableApps([installedApp]),
                removeDownloadableAppStarted(installedApp),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should disable buttons and display "Updating..." while updating an app', () => {
        expect(
            render(<AppList />, [
                addDownloadableApps([updatableApp]),
                updateDownloadableAppStarted(updatableApp),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should invoke installDownloadableApp with app name and source when install button is clicked', () => {
        mockThunk(installDownloadableApp);

        const wrapper = mount(
            <Provider
                store={preparedStore([addDownloadableApps([uninstalledApp])])}
            >
                <AppList />
            </Provider>
        );
        wrapper
            .find(`[title="Install ${uninstalledApp.displayName}"]`)
            .first()
            .simulate('click');

        expect(installDownloadableApp).toHaveBeenCalledWith(
            expect.objectContaining(uninstalledApp)
        );
    });

    it('should invoke removeDownloadableApp with app name and source when remove button is clicked', () => {
        mockThunk(removeDownloadableApp);

        const wrapper = mount(
            <Provider
                store={preparedStore([addDownloadableApps([installedApp])])}
            >
                <AppList />
            </Provider>
        );

        wrapper.find(`button.dropdown-toggle`).first().simulate('click');
        wrapper
            .find(`[title="Remove ${installedApp.displayName}"]`)
            .first()
            .simulate('click');

        expect(removeDownloadableApp).toHaveBeenCalledWith(
            expect.objectContaining(installedApp)
        );
    });

    it('should invoke checkEngineAndLaunch with given app item when Open is clicked', () => {
        mockThunk(checkEngineAndLaunch);

        const wrapper = mount(
            <Provider
                store={preparedStore([addDownloadableApps([installedApp])])}
            >
                <AppList />
            </Provider>
        );

        wrapper
            .find(`[title="Open ${installedApp.displayName}"]`)
            .first()
            .simulate('click');

        expect(checkEngineAndLaunch).toHaveBeenCalledWith(
            expect.objectContaining(installedApp)
        );
    });
});
