/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { openWindow } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { isDownloadable } from '../../../../ipc/apps';
import { DisplayedApp } from '../appsSlice';

const OpenHomepage: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    const homepage = isDownloadable(app) ? app.homepage : undefined;
    if (homepage == null) return null;

    return (
        <Dropdown.Item
            title="Go to app website"
            onClick={() => openWindow.openUrl(homepage)}
        >
            More info
        </Dropdown.Item>
    );
};

export default OpenHomepage;
