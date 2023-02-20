/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import { isDownloadable, isWithdrawn } from '../../../../ipc/apps';
import { useLauncherDispatch } from '../../../util/hooks';
import { show as showReleaseNotes } from '../../releaseNotes/releaseNotesDialogSlice';
import { DisplayedApp } from '../appsSlice';

const ShowReleaseNotes: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    const dispatch = useLauncherDispatch();
    if (!isDownloadable(app) || isWithdrawn(app) || app.releaseNotes == null)
        return null;

    return (
        <Dropdown.Item
            title="Show release notes"
            onClick={() => dispatch(showReleaseNotes(app))}
        >
            Release notes
        </Dropdown.Item>
    );
};

export default ShowReleaseNotes;
