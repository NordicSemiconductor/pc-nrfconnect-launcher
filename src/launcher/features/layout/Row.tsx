/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { classNames } from '@nordicsemiconductor/pc-nrfconnect-shared';

const Row: React.FC<{ className?: string }> = ({ children, className }) => (
    <div
        className={classNames(
            'tw--mx-4 tw-flex tw-flex-row tw-flex-wrap',
            className,
        )}
    >
        {children}
    </div>
);

export default Row;
