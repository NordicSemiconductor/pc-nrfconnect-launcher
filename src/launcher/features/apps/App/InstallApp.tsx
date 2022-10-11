/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';

import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import { installDownloadableApp } from '../appsEffects';
import {
    DisplayedApp,
    getIsAnAppInProgress,
    getIsAppInstalling,
} from '../appsSlice';

const InstallApp: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    const dispatch = useLauncherDispatch();
    const isAnAppInProgress = useLauncherSelector(getIsAnAppInProgress);
    const isInstalling = useLauncherSelector(getIsAppInstalling(app));

    if (app.isInstalled) return null;

    return (
        <Button
            variant="outline-secondary"
            title={`Install ${app.displayName}`}
            disabled={isAnAppInProgress}
            onClick={() => dispatch(installDownloadableApp(app))}
        >
            {isInstalling ? 'Installing...' : 'Install'}
        </Button>
    );
};

export default InstallApp;
