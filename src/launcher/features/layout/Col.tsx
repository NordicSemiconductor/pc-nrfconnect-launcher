/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { classNames } from '@nordicsemiconductor/pc-nrfconnect-shared';

const Col: React.FC<{
    className?: string;
    fixedSize?: boolean;
    noPadding?: boolean;
}> = ({ children, className, fixedSize = false, noPadding = false }) => (
    <div
        className={classNames(
            fixedSize ? 'tw-w-auto tw-flex-none' : 'tw-flex-1',
            noPadding || 'tw-px-4',
            className,
        )}
    >
        {children}
    </div>
);

export default Col;
