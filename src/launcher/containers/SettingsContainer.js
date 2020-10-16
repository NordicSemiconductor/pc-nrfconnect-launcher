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

import { connect } from 'react-redux';
import SettingsView from '../components/SettingsView';
import * as SettingsActions from '../actions/settingsActions';
import * as UsageDataActions from '../actions/usageDataActions';
import * as AutoUpdateActions from '../actions/autoUpdateActions';

function isAppUpdateAvailable(officialApps) {
    return !!officialApps.find(
        app => app.latestVersion && app.currentVersion !== app.latestVersion
    );
}

function mapStateToProps(state) {
    const { settings, apps } = state;

    return {
        isLoading: settings.isLoading,
        shouldCheckForUpdatesAtStartup: settings.shouldCheckForUpdatesAtStartup,
        isCheckingForUpdates: apps.isDownloadingLatestAppInfo,
        isUpdateCheckCompleteDialogVisible:
            settings.isUpdateCheckCompleteDialogVisible,
        lastUpdateCheckDate: apps.lastUpdateCheckDate,
        isAppUpdateAvailable: isAppUpdateAvailable(apps.officialApps),
        sources: settings.sources,
        isAddSourceDialogVisible: settings.isAddSourceDialogVisible,
        isRemoveSourceDialogVisible: settings.isRemoveSourceDialogVisible,
        isSendingUsageData: settings.isSendingUsageData,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onMount: () => dispatch(SettingsActions.loadSettings()),
        onCheckUpdatesAtStartupChanged: isEnabled =>
            dispatch(SettingsActions.checkUpdatesAtStartupChanged(isEnabled)),
        onTriggerUpdateCheck: () =>
            dispatch(AutoUpdateActions.checkForUpdatesManually()),
        onHideUpdateCheckCompleteDialog: () =>
            dispatch(SettingsActions.hideUpdateCheckCompleteDialog()),
        addSource: url => dispatch(SettingsActions.addSource(url)),
        removeSource: name => dispatch(SettingsActions.removeSource(name)),
        onShowAddSourceDialog: () =>
            dispatch(SettingsActions.showAddSourceDialog()),
        onHideAddSourceDialog: () =>
            dispatch(SettingsActions.hideAddSourceDialog()),
        onShowRemoveSourceDialog: name =>
            dispatch(SettingsActions.showRemoveSourceDialog(name)),
        onHideRemoveSourceDialog: () =>
            dispatch(SettingsActions.hideRemoveSourceDialog()),
        toggleSendingUsageData: () =>
            dispatch(UsageDataActions.toggleSendingUsageData()),
        showUsageDataDialog: () =>
            dispatch(UsageDataActions.showUsageDataDialog()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsView);
