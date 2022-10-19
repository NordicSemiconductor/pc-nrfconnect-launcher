/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';

import { useLauncherDispatch } from '../../../util/hooks';
import { checkEngineAndLaunch } from '../appsEffects';
import { DisplayedApp, isInProgress } from '../appsSlice';

const OpenApp: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    const dispatch = useLauncherDispatch();

    if (!app.isInstalled) return null;

    return (
        <Button
            title={`Open ${app.displayName}`}
            disabled={isInProgress(app)}
            onClick={() => dispatch(checkEngineAndLaunch(app))}
        >
            Open
        </Button>
    );
};

export default OpenApp;
