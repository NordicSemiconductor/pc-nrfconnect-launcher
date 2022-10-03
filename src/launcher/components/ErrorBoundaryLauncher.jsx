/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { getCurrentWindow } from '@electron/remote';
import { ErrorBoundary } from 'pc-nrfconnect-shared';
import { node } from 'prop-types';

import pkgJson from '../../../package.json';
import { setSetting } from '../../ipc/settings';
import { getSources } from '../features/sources/sourcesSlice';
import { sendLauncherUsageData } from '../features/usageData/usageDataEffects';
import { useLauncherSelector } from '../util/hooks';

const ErrorBoundaryLauncher = ({ children }) => {
    const sources = useLauncherSelector(getSources);

    const restoreDefaults = () => {
        // TODO: Replace with a new IPC call 'resetSettings'
        setSetting('app-management.filter', '');
        setSetting('app-management.show', {
            installed: true,
            available: true,
        });
        setSetting(
            'app-management.sources',
            Object.fromEntries(
                Object.keys(sources).map(sourceName => [sourceName, true])
            )
        );
        getCurrentWindow().reload();
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
