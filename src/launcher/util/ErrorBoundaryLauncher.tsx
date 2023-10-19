/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { getCurrentWindow } from '@electron/remote';
import { ErrorBoundary } from '@nordicsemiconductor/pc-nrfconnect-shared';

import pkgJson from '../../../package.json';
import { resetStore } from '../../ipc/persistedStore';
import { sendLauncherUsageData } from '../features/usageData/usageDataEffects';

const ErrorBoundaryLauncher: React.FC = ({ children }) => {
    const restoreDefaults = () => {
        resetStore();
        getCurrentWindow().reload();
    };

    const sendUsageData = (error: string) => {
        sendLauncherUsageData('Report error', {
            platform: process.platform,
            arch: process.arch,
            launcherVersion: pkgJson.version,
            errorMessage: error,
        });
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

export default ErrorBoundaryLauncher;
