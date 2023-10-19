/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import { isDownloadable, isInstalled } from '../../../../ipc/apps';
import { useLauncherDispatch } from '../../../util/hooks';
import { removeDownloadableApp } from '../appsEffects';
import { DisplayedApp, isInProgress } from '../appsSlice';

const UninstallApp: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    const dispatch = useLauncherDispatch();

    if (!isInstalled(app) || !isDownloadable(app)) return null;

    return (
        <Dropdown.Item
            title={`Remove ${app.displayName}`}
            disabled={isInProgress(app)}
            onClick={() =>
                dispatch(removeDownloadableApp(app, app.currentVersion))
            }
        >
            {app.progress.isRemoving ? 'Uninstalling...' : 'Uninstall'}
        </Dropdown.Item>
    );
};

export default UninstallApp;
