/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';

import { DisplayedApp, isInProgress, totalProgress } from '../appsSlice';

export default ({ app }: { app: DisplayedApp }) => {
    if (!isInProgress(app)) {
        return null;
    }

    return <ProgressBar now={totalProgress(app)} />;
};
