/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import * as SettingsActions from '../actions/settingsActions';
import * as UsageDataActions from '../actions/usageDataActions';
import SettingsView from '../components/SettingsView';
import { checkForUpdatesManually } from '../features/launcherUpdate/launcherUpdateEffects';
import {
    addSource,
    checkUpdatesAtStartupChanged,
    loadSettings,
    removeSource,
} from '../features/settings/settingsEffects';

function isAppUpdateAvailable(downloadableApps) {
    return !!downloadableApps.find(
        app => app.currentVersion && app.currentVersion !== app.latestVersion
    );
}

function mapStateToProps(state) {
    const { settings, apps } = state;

    return {
        shouldCheckForUpdatesAtStartup: settings.shouldCheckForUpdatesAtStartup,
        isCheckingForUpdates: apps.isDownloadingLatestAppInfo,
        isUpdateCheckCompleteDialogVisible:
            settings.isUpdateCheckCompleteDialogVisible,
        lastUpdateCheckDate: apps.lastUpdateCheckDate,
        isAppUpdateAvailable: isAppUpdateAvailable(apps.downloadableApps),
        sources: settings.sources,
        isAddSourceDialogVisible: settings.isAddSourceDialogVisible,
        isRemoveSourceDialogVisible: settings.isRemoveSourceDialogVisible,
        isSendingUsageData: settings.isSendingUsageData,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onMount: () => loadSettings(dispatch),
        onCheckUpdatesAtStartupChanged: isEnabled =>
            dispatch(checkUpdatesAtStartupChanged(isEnabled)),
        onTriggerUpdateCheck: () => dispatch(checkForUpdatesManually()),
        onHideUpdateCheckCompleteDialog: () =>
            dispatch(SettingsActions.hideUpdateCheckCompleteDialog()),
        addSource: url => dispatch(addSource(url)),
        removeSource: name => dispatch(removeSource(name)),
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
