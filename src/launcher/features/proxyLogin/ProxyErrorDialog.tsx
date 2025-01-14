/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    ErrorDialog,
    ExternalLink,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { getIsErrorVisible, loginErrorDialogClosed } from './proxyLoginSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isVisible = useLauncherSelector(getIsErrorVisible);

    return (
        <ErrorDialog
            isVisible={isVisible}
            onHide={() => dispatch(loginErrorDialogClosed())}
            title="Proxy error"
        >
            <p>
                It appears that you are having problems authenticating with a
                proxy server. This will prevent you from using certain features
                of nRF Connect for Desktop, such as installing downloadable apps
                or checking for updates.
            </p>
            <p>
                If you are unable to resolve the issue, then go to Settings and
                disable &quot;Check for updates at startup&quot;. Then restart
                nRF Connect for Desktop and install apps manually by following
                the instructions at{' '}
                <ExternalLink href="https://github.com/NordicSemiconductor/pc-nrfconnect-launcher" />
                .
            </p>
        </ErrorDialog>
    );
};
