/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';

import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import { show as showReleaseNotes } from '../../releaseNotes/releaseNotesDialogSlice';
import { DisplayedApp, getIsAnAppInProgress } from '../appsSlice';

const UpdateApp: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    const dispatch = useLauncherDispatch();
    const isAnAppInProgress = useLauncherSelector(getIsAnAppInProgress);

    if (!app.isInstalled || !app.isDownloadable || !app.upgradeAvailable)
        return null;

    return (
        <Button
            variant="outline-primary"
            title={`Update ${app.displayName}`}
            disabled={isAnAppInProgress}
            onClick={() => dispatch(showReleaseNotes(app))}
        >
            {app.progress.isUpgrading ? 'Updating...' : 'Update'}
        </Button>
    );
};

export default UpdateApp;
