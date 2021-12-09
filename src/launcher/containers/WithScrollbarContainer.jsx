/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { bool, node } from 'prop-types';

const WithScrollbarContainer = ({ children, hasFilter = false }) => {
    if (hasFilter)
        return (
            <div className="with-scrollbar filter-adjusted-height">
                <div className="content-container">{children}</div>
            </div>
        );
    return (
        <div className="with-scrollbar">
            <div className="content-container">{children}</div>
        </div>
    );
};

WithScrollbarContainer.propTypes = {
    hasFilter: bool,
    children: node,
};

export default WithScrollbarContainer;
