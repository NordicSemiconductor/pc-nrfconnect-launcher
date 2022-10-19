/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/first */

// Do not render react-bootstrap components in tests
jest.mock('react-bootstrap', () => ({
    Modal: 'Modal',
    Button: 'Button',
    ModalHeader: 'ModalHeader',
    ModalFooter: 'ModalFooter',
    ModalBody: 'ModalBody',
    ModalTitle: 'ModalTitle',
}));

import React from 'react';

import render from '../../../testrenderer';
import {
    downloadLatestAppInfoStarted,
    downloadLatestAppInfoSuccess,
    loadDownloadableAppsSuccess,
} from '../apps/appsSlice';
import {
    setCheckUpdatesAtStartup,
    showUpdateCheckComplete,
} from './settingsSlice';
import SettingsView from './SettingsView';

const unimportantAppProperties = {
    name: 'test-app',
    displayName: 'test app',
    description: 'the test app',
    isDownloadable: true,
    source: 'test source',
    url: 'test url',
    isInstalled: true,
    path: 'test path',
    iconPath: 'test icon path',
    shortcutIconPath: 'test shortcut icon path',
} as const;

describe('SettingsView', () => {
    it('should render with check for updates enabled', () => {
        expect(
            render(<SettingsView />, [setCheckUpdatesAtStartup(true)])
                .baseElement
        ).toMatchSnapshot();
    });

    it('should render with check for updates disabled', () => {
        expect(
            render(<SettingsView />, [setCheckUpdatesAtStartup(false)])
                .baseElement
        ).toMatchSnapshot();
    });

    it('should render when checking for updates', () => {
        expect(
            render(<SettingsView />, [downloadLatestAppInfoStarted()])
                .baseElement
        ).toMatchSnapshot();
    });

    it('should render with last update check date', () => {
        expect(
            render(<SettingsView />, [
                downloadLatestAppInfoSuccess(
                    new Date(2017, 1, 3, 13, 41, 36, 20)
                ),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should render check for updates completed, with updates available', () => {
        expect(
            render(<SettingsView />, [
                showUpdateCheckComplete(),
                loadDownloadableAppsSuccess({
                    downloadableApps: [
                        {
                            currentVersion: '1.0.0',
                            latestVersion: '1.2.3',
                            upgradeAvailable: true,
                            ...unimportantAppProperties,
                        },
                    ],
                }),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should render check for updates completed, with everything up to date', () => {
        expect(
            render(<SettingsView />, [
                showUpdateCheckComplete(),
                loadDownloadableAppsSuccess({
                    downloadableApps: [
                        {
                            currentVersion: '1.0.0',
                            latestVersion: '1.0.0',
                            upgradeAvailable: false,
                            ...unimportantAppProperties,
                        },
                    ],
                }),
            ]).baseElement
        ).toMatchSnapshot();
    });
});
