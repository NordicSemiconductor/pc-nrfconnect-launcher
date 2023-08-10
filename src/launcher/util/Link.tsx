/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

export default ({ href }: { href: string }) => (
    <a target="_blank" href={href} rel="noreferrer">
        {href}
    </a>
);
