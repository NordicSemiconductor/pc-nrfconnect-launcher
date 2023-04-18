/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import { isDownloadable } from '../../../../ipc/apps';
import { useLauncherDispatch } from '../../../util/hooks';
import { showInstallOtherVersionDialog } from '../appDialogsSlice';
import { DisplayedApp, isInProgress } from '../appsSlice';

const UninstallApp: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    const dispatch = useLauncherDispatch();

    if (!isDownloadable(app)) return null;

    return (
        <Dropdown.Item
            title={`Install other version of ${app.displayName}`}
            disabled={isInProgress(app)}
            onClick={() => dispatch(showInstallOtherVersionDialog(app))}
        >
            Install other version
        </Dropdown.Item>
    );
};

export default UninstallApp;
