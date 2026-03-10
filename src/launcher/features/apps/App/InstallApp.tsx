/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Button } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { isInstalled, isWithdrawn } from '../../../../ipc/apps';
import { useLauncherDispatch } from '../../../util/hooks';
import { installDownloadableApp } from '../appsEffects';
import { type DisplayedApp, isInProgress } from '../appsSlice';

export interface InstallAppProps {
    app: DisplayedApp;
    className?: string;
}

const InstallApp: React.FC<InstallAppProps> = ({ app, className }) => {
    const dispatch = useLauncherDispatch();
    if (isInstalled(app) || isWithdrawn(app)) return null;

    return (
        <Button
            variant="secondary"
            size="xl"
            title={`Install ${app.displayName}`}
            className={className}
            disabled={isInProgress(app)}
            onClick={() => dispatch(installDownloadableApp(app))}
        >
            {app.progress.isInstalling ? 'Installing…' : 'Install'}
        </Button>
    );
};

export default InstallApp;
