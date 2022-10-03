/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import * as AppsActions from '../actions/appsActions';
import AppManagementFilter from '../components/AppManagementFilter';

export default connect(
    state => ({
        upgradeableApps: state.apps.downloadableApps.filter(
            app => app.upgradeAvailable
        ),
    }),
    dispatch => ({
        onUpgrade: (name, version, source) =>
            dispatch(AppsActions.upgradeDownloadableApp(name, version, source)),
    })
)(AppManagementFilter);
