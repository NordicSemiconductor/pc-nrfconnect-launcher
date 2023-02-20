/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';

import { isInstalled, isWithdrawn } from '../../../../ipc/apps';
import { useLauncherDispatch } from '../../../util/hooks';
import { installDownloadableApp } from '../appsEffects';
import { DisplayedApp, isInProgress } from '../appsSlice';

const InstallApp: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    const dispatch = useLauncherDispatch();
    if (isInstalled(app) || isWithdrawn(app)) return null;

    return (
        <Button
            variant="outline-secondary"
            title={`Install ${app.displayName}`}
            disabled={isInProgress(app)}
            onClick={() => dispatch(installDownloadableApp(app))}
        >
            {app.progress.isInstalling ? 'Installing...' : 'Install'}
        </Button>
    );
};

export default InstallApp;
