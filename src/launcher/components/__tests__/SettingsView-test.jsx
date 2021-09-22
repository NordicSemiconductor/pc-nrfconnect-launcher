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
import { shallow } from 'enzyme';
import { Map } from 'immutable';

import SettingsView from '../SettingsView';

describe('SettingsView', () => {
    it('should render empty div while loading', () => {
        expect(
            shallow(
                <SettingsView
                    isLoading
                    isSendingUsageData={false}
                    showUsageDataDialog={() => {}}
                    toggleSendingUsageData={() => {}}
                    shouldCheckForUpdatesAtStartup
                    isCheckingForUpdates={false}
                    onTriggerUpdateCheck={() => {}}
                    onCheckUpdatesAtStartupChanged={() => {}}
                    onHideUpdateCheckCompleteDialog={() => {}}
                    sources={Map({})}
                    addSource={() => {}}
                    onShowRemoveSourceDialog={() => {}}
                    onShowAddSourceDialog={() => {}}
                    onHideAddSourceDialog={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render with check for updates enabled', () => {
        expect(
            shallow(
                <SettingsView
                    isLoading={false}
                    isSendingUsageData={false}
                    showUsageDataDialog={() => {}}
                    toggleSendingUsageData={() => {}}
                    shouldCheckForUpdatesAtStartup
                    isCheckingForUpdates={false}
                    onTriggerUpdateCheck={() => {}}
                    onCheckUpdatesAtStartupChanged={() => {}}
                    onHideUpdateCheckCompleteDialog={() => {}}
                    sources={Map({})}
                    addSource={() => {}}
                    onShowRemoveSourceDialog={() => {}}
                    onShowAddSourceDialog={() => {}}
                    onHideAddSourceDialog={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render with check for updates disabled', () => {
        expect(
            shallow(
                <SettingsView
                    isLoading={false}
                    isSendingUsageData={false}
                    showUsageDataDialog={() => {}}
                    toggleSendingUsageData={() => {}}
                    shouldCheckForUpdatesAtStartup={false}
                    isCheckingForUpdates={false}
                    onTriggerUpdateCheck={() => {}}
                    onCheckUpdatesAtStartupChanged={() => {}}
                    onHideUpdateCheckCompleteDialog={() => {}}
                    sources={Map({})}
                    addSource={() => {}}
                    onShowRemoveSourceDialog={() => {}}
                    onShowAddSourceDialog={() => {}}
                    onHideAddSourceDialog={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render when checking for updates', () => {
        expect(
            shallow(
                <SettingsView
                    isLoading={false}
                    isSendingUsageData={false}
                    showUsageDataDialog={() => {}}
                    toggleSendingUsageData={() => {}}
                    shouldCheckForUpdatesAtStartup={false}
                    isCheckingForUpdates
                    onTriggerUpdateCheck={() => {}}
                    onCheckUpdatesAtStartupChanged={() => {}}
                    onHideUpdateCheckCompleteDialog={() => {}}
                    sources={Map({})}
                    addSource={() => {}}
                    onShowRemoveSourceDialog={() => {}}
                    onShowAddSourceDialog={() => {}}
                    onHideAddSourceDialog={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render with last update check date', () => {
        expect(
            shallow(
                <SettingsView
                    isLoading={false}
                    isSendingUsageData={false}
                    showUsageDataDialog={() => {}}
                    toggleSendingUsageData={() => {}}
                    shouldCheckForUpdatesAtStartup={false}
                    isCheckingForUpdates={false}
                    lastUpdateCheckDate={new Date(2017, 1, 3, 13, 41, 36, 20)}
                    onTriggerUpdateCheck={() => {}}
                    onCheckUpdatesAtStartupChanged={() => {}}
                    onHideUpdateCheckCompleteDialog={() => {}}
                    sources={Map({})}
                    addSource={() => {}}
                    onShowRemoveSourceDialog={() => {}}
                    onShowAddSourceDialog={() => {}}
                    onHideAddSourceDialog={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render check for updates completed, with updates available', () => {
        expect(
            shallow(
                <SettingsView
                    isLoading={false}
                    isSendingUsageData={false}
                    showUsageDataDialog={() => {}}
                    toggleSendingUsageData={() => {}}
                    shouldCheckForUpdatesAtStartup={false}
                    isCheckingForUpdates={false}
                    lastUpdateCheckDate={new Date(2017, 1, 3, 13, 41, 36, 20)}
                    onTriggerUpdateCheck={() => {}}
                    onCheckUpdatesAtStartupChanged={() => {}}
                    onHideUpdateCheckCompleteDialog={() => {}}
                    isUpdateCheckCompleteDialogVisible
                    isAppUpdateAvailable
                    sources={Map({})}
                    addSource={() => {}}
                    onShowRemoveSourceDialog={() => {}}
                    onShowAddSourceDialog={() => {}}
                    onHideAddSourceDialog={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render check for updates completed, with everything up to date', () => {
        expect(
            shallow(
                <SettingsView
                    isLoading={false}
                    isSendingUsageData={false}
                    showUsageDataDialog={() => {}}
                    toggleSendingUsageData={() => {}}
                    shouldCheckForUpdatesAtStartup={false}
                    isCheckingForUpdates={false}
                    lastUpdateCheckDate={new Date(2017, 1, 3, 13, 41, 36, 20)}
                    onTriggerUpdateCheck={() => {}}
                    onCheckUpdatesAtStartupChanged={() => {}}
                    onHideUpdateCheckCompleteDialog={() => {}}
                    isUpdateCheckCompleteDialogVisible
                    isAppUpdateAvailable={false}
                    sources={Map({})}
                    addSource={() => {}}
                    onShowRemoveSourceDialog={() => {}}
                    onShowAddSourceDialog={() => {}}
                    onHideAddSourceDialog={() => {}}
                />
            )
        ).toMatchSnapshot();
    });
});
