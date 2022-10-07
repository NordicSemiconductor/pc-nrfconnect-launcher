/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import AppManagementView from '../components/AppManagementView';
import { getAppsFilter } from '../features/filter/filterSlice';

function mapStateToProps(state) {
    const {
        apps: {
            localApps,
            downloadableApps,
            installingAppName,
            removingAppName,
            upgradingAppName,
        },
    } = state;
    const allApps = localApps.concat(downloadableApps);

    const appsFilter = getAppsFilter(state);
    const apps = allApps.filter(appsFilter).sort((a, b) => {
        const cmpInstalled = !!b.currentVersion - !!a.currentVersion;
        const aName = a.displayName || a.name;
        const bName = b.displayName || b.name;
        return cmpInstalled || aName.localeCompare(bName);
    });

    return {
        apps,
        isProcessing:
            !!installingAppName || !!upgradingAppName || !!removingAppName,
    };
}

export default connect(mapStateToProps)(AppManagementView);
