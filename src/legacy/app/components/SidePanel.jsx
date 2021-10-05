/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { node, number, string } from 'prop-types';

const SidePanel = ({ children, cssClass, width }) => (
    <div className={cssClass} style={{ width: `${width}px` }}>
        {children || (
            <div>
                <h4>Side panel</h4>
                <p>
                    Implement <code>decorateSidePanel</code> to add your own
                    content here.
                </p>
            </div>
        )}
    </div>
);

SidePanel.propTypes = {
    width: number,
    children: node,
    cssClass: string,
};

SidePanel.defaultProps = {
    width: 260,
    children: null,
    cssClass: 'core-side-panel',
};

export default SidePanel;
