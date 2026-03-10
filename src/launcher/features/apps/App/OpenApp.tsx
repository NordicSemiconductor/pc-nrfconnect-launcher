/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Button } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { isInstalled } from '../../../../ipc/apps';
import { useLauncherDispatch } from '../../../util/hooks';
import { checkCompatibilityThenLaunch } from '../appsEffects';
import { type DisplayedApp, isInProgress } from '../appsSlice';

export interface OpenAppProps {
    app: DisplayedApp;
    className?: string;
}

const OpenApp: React.FC<OpenAppProps> = ({ app, className }) => {
    const dispatch = useLauncherDispatch();

    if (!isInstalled(app)) return null;

    return (
        <Button
            variant="primary"
            size="xl"
            title={`Open ${app.displayName}`}
            className={className}
            disabled={isInProgress(app)}
            onClick={() => dispatch(checkCompatibilityThenLaunch(app))}
        >
            Open
        </Button>
    );
};

export default OpenApp;
