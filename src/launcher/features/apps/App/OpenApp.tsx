/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';

import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import { checkEngineAndLaunch } from '../appsEffects';
import { DisplayedApp, getIsAnAppInProgress } from '../appsSlice';

const OpenApp: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    const dispatch = useLauncherDispatch();
    const isAnAppInProgress = useLauncherSelector(getIsAnAppInProgress);

    if (!app.isInstalled) return null;

    return (
        <Button
            title={`Open ${app.displayName}`}
            disabled={isAnAppInProgress}
            onClick={() => dispatch(checkEngineAndLaunch(app))}
        >
            Open
        </Button>
    );
};

export default OpenApp;
