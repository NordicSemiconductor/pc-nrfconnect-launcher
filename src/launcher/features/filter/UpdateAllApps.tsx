/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { upgradeDownloadableApp } from '../apps/appsEffects';
import { getUpgradeableVisibleApps } from '../apps/appsSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const upgradeableApps = useLauncherSelector(getUpgradeableVisibleApps);

    const upgradeAllApps = () =>
        upgradeableApps.forEach(app =>
            dispatch(upgradeDownloadableApp(app, app.latestVersion))
        );

    if (upgradeableApps.length === 0) return null;

    return (
        <Button
            variant="outline-secondary"
            onClick={upgradeAllApps}
            className="me_32px"
        >
            Update all apps
        </Button>
    );
};
