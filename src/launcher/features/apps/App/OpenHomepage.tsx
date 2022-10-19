/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { openUrl } from 'pc-nrfconnect-shared';

import { DisplayedApp } from '../appsSlice';

const OpenHomepage: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    if (!app.isDownloadable || app.homepage == null) return null;

    return (
        <Dropdown.Item
            title="Go to app website"
            onClick={() => openUrl(app.homepage!)} // eslint-disable-line @typescript-eslint/no-non-null-assertion
        >
            More info
        </Dropdown.Item>
    );
};

export default OpenHomepage;
