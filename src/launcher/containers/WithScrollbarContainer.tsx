/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { classNames } from 'pc-nrfconnect-shared';

const WithScrollbarContainer: React.FC<{
    hasFilter?: boolean;
}> = ({ children, hasFilter = false }) => (
    <div
        className={classNames(
            'with-scrollbar',
            hasFilter && 'filter-adjusted-height'
        )}
    >
        <div className="content-container">{children}</div>
    </div>
);

export default WithScrollbarContainer;
