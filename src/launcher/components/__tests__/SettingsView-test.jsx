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

jest.mock('../../containers/ConfirmRemoveSourceDialog', () => 'div');

import React from 'react';

import render from '../../../testrenderer';
import {
    downloadLatestAppInfoAction,
    downloadLatestAppInfoSuccessAction,
    loadDownloadableAppsSuccess,
} from '../../actions/appsActions';
import {
    checkUpdatesAtStartupChangedAction,
    showUpdateCheckCompleteDialog,
} from '../../actions/settingsActions';
import SettingsView from '../../containers/SettingsContainer';

describe('SettingsView', () => {
    it('should render with check for updates enabled', () => {
        expect(
            render(<SettingsView />, [checkUpdatesAtStartupChangedAction(true)])
                .baseElement
        ).toMatchSnapshot();
    });

    it('should render with check for updates disabled', () => {
        expect(
            render(<SettingsView />, [
                checkUpdatesAtStartupChangedAction(false),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should render when checking for updates', () => {
        expect(
            render(<SettingsView />, [downloadLatestAppInfoAction()])
                .baseElement
        ).toMatchSnapshot();
    });

    it('should render with last update check date', () => {
        expect(
            render(<SettingsView />, [
                downloadLatestAppInfoSuccessAction(
                    new Date(2017, 1, 3, 13, 41, 36, 20)
                ),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should render check for updates completed, with updates available', () => {
        expect(
            render(<SettingsView />, [
                showUpdateCheckCompleteDialog(),
                loadDownloadableAppsSuccess([
                    {
                        currentVersion: '1.0.0',
                        latestVersion: '1.2.3',
                    },
                ]),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('should render check for updates completed, with everything up to date', () => {
        expect(
            render(<SettingsView />, [
                showUpdateCheckCompleteDialog(),
                loadDownloadableAppsSuccess([
                    {
                        currentVersion: '1.0.0',
                        latestVersion: '1.0.0',
                    },
                ]),
            ]).baseElement
        ).toMatchSnapshot();
    });
});
