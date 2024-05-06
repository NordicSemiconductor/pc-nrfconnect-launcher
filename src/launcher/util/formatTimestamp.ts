/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export default function formatPublishTimestamp(publishTimestamp?: string) {
    if (!publishTimestamp) return '';

    return `, on ${new Date(publishTimestamp).toLocaleString()}`;
}
