/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { classNames } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { isDropZoneVisible } from './localAppInstallSlice';

import styles from './dropZoneInfo.module.scss';

export default () => {
    const isVisible = useSelector(isDropZoneVisible);

    return (
        <div
            className={classNames(styles.backdrop, isVisible)}
            style={{ opacity: isVisible ? 1 : 0 }} // Opacity is done here instead of in the SCSS to test it easier in the unit test
        >
            <div className={styles.infobox}>
                <div>Drop app package files to install them as local apps</div>
            </div>
        </div>
    );
};
