/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Alert } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { isIntelElectronOnAppleSilicon } from './appleSiliconSlice';

export default () =>
    isIntelElectronOnAppleSilicon ? (
        <Alert variant="warning">
            <div className="tw-text-sm tw-text-white">
                <strong>Warning: </strong>A native Apple Silicon build is{' '}
                <a
                    target="_blank"
                    rel="noreferrer noopener"
                    href="https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/releases/latest"
                    className="tw-preflight tw-text-white tw-underline"
                >
                    available for download
                </a>
                . Using an Intel build of nRF Connect for Desktop may result in
                unexpected behavior and is not supported.
            </div>
        </Alert>
    ) : null;
