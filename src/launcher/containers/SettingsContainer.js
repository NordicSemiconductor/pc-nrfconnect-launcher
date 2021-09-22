/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import * as AutoUpdateActions from '../actions/autoUpdateActions';
import * as SettingsActions from '../actions/settingsActions';
import * as UsageDataActions from '../actions/usageDataActions';
import SettingsView from '../components/SettingsView';

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
