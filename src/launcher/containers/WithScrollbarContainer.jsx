/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { bool, node } from 'prop-types';

const WithScrollbarContainer = ({ children, hasFilter = false }) => (
    <div
        className={`with-scrollbar ${
            hasFilter ? 'filter-adjusted-height' : ''
        }`}
    >
        <div className="content-container">{children}</div>
    </div>
);

WithScrollbarContainer.propTypes = {
    hasFilter: bool,
    children: node,
};

export default WithScrollbarContainer;
