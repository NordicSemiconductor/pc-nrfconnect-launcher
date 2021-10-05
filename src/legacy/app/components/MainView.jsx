/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { node, string } from 'prop-types';

const MainView = ({ children, cssClass }) => (
    <div className={cssClass}>
        {children || (
            <div>
                <h4>Main view</h4>
                <p>
                    Implement <code>decorateMainView</code> to add your own
                    content here.
                </p>
            </div>
        )}
    </div>
);

MainView.propTypes = {
    children: node,
    cssClass: string,
};

MainView.defaultProps = {
    children: null,
    cssClass: 'core-main-view',
};

export default MainView;
