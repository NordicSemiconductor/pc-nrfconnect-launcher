/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import * as AppsActions from '../actions/appsActions';
import AppManagementFilter from '../components/AppManagementFilter';

export default connect(
    ({ apps: { show, filter } }, { apps }) => ({
        show: { ...show },
        filter,
        upgradeableApps: apps.filter(app => app.upgradeAvailable),
    }),
    dispatch => ({
        onUpgrade: (name, version, source) =>
            dispatch(AppsActions.upgradeOfficialApp(name, version, source)),
        setAppManagementShow: show =>
            dispatch(AppsActions.setAppManagementShow(show)),
        setAppManagementFilter: filter =>
            dispatch(AppsActions.setAppManagementFilter(filter)),
        setAppManagementSource: (source, show) =>
            dispatch(AppsActions.setAppManagementSource(source, show)),
    })
)(AppManagementFilter);
