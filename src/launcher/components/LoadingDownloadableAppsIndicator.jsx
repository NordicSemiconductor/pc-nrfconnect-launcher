/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { classNames, Spinner } from 'pc-nrfconnect-shared';

import styles from './loadingDownloadableAppsIndicator.module.scss';

export default () => {
    const isLoadingOfficialApps = useSelector(
        state => state.apps.isLoadingOfficialApps
    );

    return (
        <div
            className={classNames(
                styles.indicator,
                isLoadingOfficialApps ? styles.visible : styles.hidden
            )}
        >
            <Spinner /> Loading infos about downloadable apps …
        </div>
    );
};
