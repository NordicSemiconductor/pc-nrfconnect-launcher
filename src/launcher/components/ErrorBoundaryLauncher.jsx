/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import { remote } from 'electron';
import { ErrorBoundary } from 'pc-nrfconnect-shared';
import { node } from 'prop-types';

import pkgJson from '../../../package.json';
import * as AppsActions from '../actions/appsActions';
import { sendLauncherUsageData } from '../actions/usageDataActions';

const ErrorBoundaryLauncher = ({ children }) => {
    const dispatch = useDispatch();

    const restoreDefaults = () => {
        dispatch(AppsActions.setAppManagementFilter(''));
        dispatch(AppsActions.setAppManagementShow({}));
        dispatch(AppsActions.setAppManagementSource({}));
        remote.getCurrentWindow().reload();
    };

    const sendUsageData = error => {
        const launcherInfo = pkgJson.version ? `v${pkgJson.version}` : '';
        const errorLabel = `${process.platform}; ${process.arch}; v${launcherInfo}; ${error}`;
        sendLauncherUsageData('Report error', errorLabel);
    };

    return (
        <ErrorBoundary
            appName="Launcher"
            restoreDefaults={restoreDefaults}
            sendUsageData={sendUsageData}
        >
            {children}
        </ErrorBoundary>
    );
};

ErrorBoundaryLauncher.propTypes = {
    children: node,
};

export default ErrorBoundaryLauncher;
