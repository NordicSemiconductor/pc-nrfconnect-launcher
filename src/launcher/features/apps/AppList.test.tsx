/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import {
    InstalledDownloadableApp,
    LocalApp,
    UninstalledDownloadableApp,
} from '../../../ipc/apps';
import { LOCAL, OFFICIAL } from '../../../ipc/sources';
import render, { preparedStore } from '../../../testrenderer';
import { setAllShownSources } from '../filter/filterSlice';
import AppList from './AppList';
import {
    checkEngineAndLaunch,
    installDownloadableApp,
    removeDownloadableApp,
} from './appsEffects';
import {
    installDownloadableAppStarted,
    loadLocalAppsSuccess,
    removeDownloadableAppStarted,
    updateAllDownloadableApps,
    upgradeDownloadableAppStarted,
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

const localApp: LocalApp = {
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

const updateableApp: InstalledDownloadableApp = {
    name: 'appA',
    source: OFFICIAL,
    displayName: 'App A',
    description: 'appA description',
    isInstalled: true,
    isDownloadable: true,
    currentVersion: '1.2.3',
    latestVersion: '1.2.4',
    upgradeAvailable: true,

    engineVersion: '6.1.0',
    url: '',
    path: '',
    iconPath: '',
    shortcutIconPath: '',
};

const uninstalledApp: UninstalledDownloadableApp = {
    name: 'appB',
    source: OFFICIAL,
    displayName: 'App B',
    description: 'appB description',
    isInstalled: false,
    isDownloadable: true,

    url: '',
    latestVersion: '',
    iconPath: '',
    currentVersion: undefined,
};

const installedApp: InstalledDownloadableApp = {
    name: 'appC',
    source: OFFICIAL,
    displayName: 'App C',
    description: 'appC description',
    isInstalled: true,
    isDownloadable: true,
    currentVersion: '1.2.3',
    latestVersion: '1.2.3',

    engineVersion: '6.1.0',
    url: '',
    path: '',
    iconPath: '',
    shortcutIconPath: '',
};

const mockThunk = (thunkToMock: jest.MockableFunction) => {
    jest.mocked(thunkToMock).mockReturnValue({
        type: 'an action',
    });
};

describe('AppList', () => {
    it('should render without any apps', () => {
        expect(render(<AppList />).baseElement).toMatchSnapshot();
    });

    it('should render local, not-installed, installed, and upgradable apps', () => {
        expect(
            render(<AppList />, [
                setAllShownSources(new Set([OFFICIAL, LOCAL])),
                updateAllDownloadableApps([
                    uninstalledApp,
                    installedApp,
                    updateableApp,
                ]),
                loadLocalAppsSuccess([localApp]),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should disable buttons and display "Installing..." button text while installing an app', () => {
        expect(
            render(<AppList />, [
                setAllShownSources(new Set([OFFICIAL, LOCAL])),
                updateAllDownloadableApps([uninstalledApp]),
                installDownloadableAppStarted(uninstalledApp),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should disable buttons while removing an app', () => {
        expect(
            render(<AppList />, [
                setAllShownSources(new Set([OFFICIAL, LOCAL])),
                updateAllDownloadableApps([installedApp]),
                removeDownloadableAppStarted(installedApp),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should disable buttons and display "Updating..." while updating an app', () => {
        expect(
            render(<AppList />, [
                setAllShownSources(new Set([OFFICIAL, LOCAL])),
                updateAllDownloadableApps([updateableApp]),
                upgradeDownloadableAppStarted(updateableApp),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should invoke installDownloadableApp with app name and source when install button is clicked', () => {
        mockThunk(installDownloadableApp);

        const wrapper = mount(
            <Provider
                store={preparedStore([
                    setAllShownSources(new Set([OFFICIAL, LOCAL])),
                    updateAllDownloadableApps([uninstalledApp]),
                ])}
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
                store={preparedStore([
                    setAllShownSources(new Set([OFFICIAL, LOCAL])),
                    updateAllDownloadableApps([installedApp]),
                ])}
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
                store={preparedStore([
                    setAllShownSources(new Set([OFFICIAL, LOCAL])),
                    updateAllDownloadableApps([installedApp]),
                ])}
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
