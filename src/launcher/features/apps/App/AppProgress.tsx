/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';

import { DisplayedApp, isInProgress } from '../appsSlice';

const AppProgress: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    if (!isInProgress(app)) {
        return null;
    }

    const noOfItems = Object.keys(app.progress.fractions).length;

    return (
        <ProgressBar
            now={
                noOfItems > 0
                    ? Object.keys(app.progress.fractions)
                          .map(key => app.progress.fractions[key])
                          .reduce((pv, cr) => pv + cr, 0) / noOfItems
                    : 0
            }
        />
    );
};

export default AppProgress;
