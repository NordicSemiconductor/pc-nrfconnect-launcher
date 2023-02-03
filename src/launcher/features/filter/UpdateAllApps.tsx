/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';

import { isWithdrawn } from '../../../ipc/apps';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { updateDownloadableApp } from '../apps/appsEffects';
import { getUpdatableVisibleApps } from '../apps/appsSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const updatableApps = useLauncherSelector(getUpdatableVisibleApps);

    const updateAllApps = () =>
        updatableApps.forEach(app => {
            if (!isWithdrawn(app)) {
                dispatch(updateDownloadableApp(app, app.latestVersion));
            }
        });

    if (updatableApps.length === 0) return null;

    return (
        <Button
            variant="outline-secondary"
            onClick={updateAllApps}
            className="me_32px"
        >
            Update all apps
        </Button>
    );
};
