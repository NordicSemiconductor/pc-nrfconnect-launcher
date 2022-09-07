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
        setAppManagementShow: async show =>
            dispatch(await AppsActions.setAppManagementShow(show)),
        setAppManagementFilter: async filter =>
            dispatch(await AppsActions.setAppManagementFilter(filter)),
        setAppManagementSource: async (source, show) =>
            dispatch(await AppsActions.setAppManagementSource(source, show)),
    })
)(AppManagementFilter);
