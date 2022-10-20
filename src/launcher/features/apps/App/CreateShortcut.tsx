/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import { createDesktopShortcut } from '../../../../ipc/createDesktopShortcut';
import { DisplayedApp, isInProgress } from '../appsSlice';

const CreateShortcut: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    if (!app.isInstalled) return null;

    return (
        <Dropdown.Item
            disabled={isInProgress(app)}
            title="Create a desktop shortcut for this app"
            onClick={() => createDesktopShortcut(app)}
        >
            Create shortcut
        </Dropdown.Item>
    );
};

export default CreateShortcut;
