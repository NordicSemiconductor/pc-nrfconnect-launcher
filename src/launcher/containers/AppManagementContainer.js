/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import { openUrl } from 'pc-nrfconnect-shared';

import * as AppsActions from '../actions/appsActions';
import * as DesktopShortcutActions from '../actions/desktopShortcutActions';
import * as ReleaseNotes from '../actions/releaseNotesDialogActions';
import AppManagementView from '../components/AppManagementView';

const filterByInput = filter => app => {
    try {
        return new RegExp(filter, 'i').test(app.displayName);
    } catch (_) {
        //
    }
    return app.displayName?.includes(filter);
};

function mapStateToProps(state) {
    const {
        apps: {
            localApps,
            officialApps,
            installingAppName,
            removingAppName,
            upgradingAppName,
            show,
            filter,
            sources,
        },
    } = state;
    const allApps = localApps.concat(officialApps);
    const apps = allApps
        .filter(filterByInput(filter))
        .filter(
            app =>
                ((app.isOfficial === true && app.path && show.installed) ||
                    (app.isOfficial === null && !app.path && show.available) ||
                    app.isOfficial === false) &&
                sources[app.source || 'local'] !== false
        )
        .sort((a, b) => {
            const cmpInstalled = !!b.currentVersion - !!a.currentVersion;
            const aName = a.displayName || a.name;
            const bName = b.displayName || b.name;
            return cmpInstalled || aName.localeCompare(bName);
        });

    const allSources = [
        ...new Set(allApps.map(({ source }) => source || 'local')),
    ];
    allSources.forEach(x => {
        if (sources[x] === undefined) {
            sources[x] = true;
        }
    });

    return {
        apps,
        installingAppName,
        removingAppName,
        upgradingAppName,
        isProcessing:
            !!installingAppName || !!upgradingAppName || !!removingAppName,
        show: { ...show },
        filter,
        upgradeableApps: apps.filter(app => app.upgradeAvailable),
        sources,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onInstall: (name, source) =>
            dispatch(AppsActions.installOfficialApp(name, source)),
        onRemove: (name, source) =>
            dispatch(AppsActions.removeOfficialApp(name, source)),
        onReadMore: homepage => openUrl(homepage),
        // Launcher actions
        onAppSelected: app => dispatch(AppsActions.checkEngineAndLaunch(app)),
        onCreateShortcut: app =>
            dispatch(DesktopShortcutActions.createShortcut(app)),
        onShowReleaseNotes: appid => dispatch(ReleaseNotes.show(appid)),
        onUpgrade: (name, version, source) =>
            dispatch(AppsActions.upgradeOfficialApp(name, version, source)),
        setAppManagementShow: show =>
            dispatch(AppsActions.setAppManagementShow(show)),
        setAppManagementFilter: filter =>
            dispatch(AppsActions.setAppManagementFilter(filter)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppManagementView);
