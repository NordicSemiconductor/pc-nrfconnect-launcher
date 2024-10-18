/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { type ReactNode } from 'react';

export default ({ href, children }: { href: string; children?: ReactNode }) => (
    <a target="_blank" href={href} rel="noreferrer">
        {children ?? href}
    </a>
);
