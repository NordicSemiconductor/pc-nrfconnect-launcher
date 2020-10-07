/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
