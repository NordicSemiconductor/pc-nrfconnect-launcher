/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';

import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import { installDownloadableApp } from '../appsEffects';
import { DisplayedApp, getIsAnAppInProgress } from '../appsSlice';

const InstallApp: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    const dispatch = useLauncherDispatch();
    const isAnAppInProgress = useLauncherSelector(getIsAnAppInProgress);

    if (app.isInstalled) return null;

    return (
        <Button
            variant="outline-secondary"
            title={`Install ${app.displayName}`}
            disabled={isAnAppInProgress}
            onClick={() => dispatch(installDownloadableApp(app))}
        >
            {app.progress.isInstalling ? 'Installing...' : 'Install'}
        </Button>
    );
};

export default InstallApp;
