/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { createDownloadableTestApp } from '../../../test/testFixtures';
import render from '../../../test/testrenderer';
import {
    downloadLatestAppInfoStarted,
    downloadLatestAppInfoSuccess,
    setAllDownloadableApps,
} from '../apps/appsSlice';
import Settings from './Settings';
import {
    setCheckUpdatesAtStartup,
    showUpdateCheckComplete,
} from './settingsSlice';

// Do not render react-bootstrap components in tests
jest.mock('react-bootstrap', () => ({
    Modal: 'Modal',
    Button: 'Button',
    ModalHeader: 'ModalHeader',
    ModalFooter: 'ModalFooter',
    ModalBody: 'ModalBody',
    ModalTitle: 'ModalTitle',
}));

describe('SettingsView', () => {
    it('should render with check for updates enabled', () => {
        expect(
            render(<Settings />, [setCheckUpdatesAtStartup(true)]).baseElement
        ).toMatchSnapshot();
    });

    it('should render with check for updates disabled', () => {
        expect(
            render(<Settings />, [setCheckUpdatesAtStartup(false)]).baseElement
        ).toMatchSnapshot();
    });

    it('should render when checking for updates', () => {
        expect(
            render(<Settings />, [downloadLatestAppInfoStarted()]).baseElement
        ).toMatchSnapshot();
    });

    it('should render with last update check date', () => {
        expect(
            render(<Settings />, [
                downloadLatestAppInfoSuccess(
                    new Date(2017, 1, 3, 13, 41, 36, 20)
                ),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should render check for updates completed, with updates available', () => {
        expect(
            render(<Settings />, [
                showUpdateCheckComplete(),
                setAllDownloadableApps([
                    createDownloadableTestApp(undefined, {
                        currentVersion: '1.0.0',
                        latestVersion: '1.2.3',
                        updateAvailable: true,
                    }),
                ]),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should render check for updates completed, with everything up to date', () => {
        expect(
            render(<Settings />, [
                showUpdateCheckComplete(),
                setAllDownloadableApps([createDownloadableTestApp()]),
            ]).baseElement
        ).toMatchSnapshot();
    });
});
