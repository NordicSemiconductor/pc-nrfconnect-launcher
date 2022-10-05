/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

declare interface Window {
    collectIstanbulCoverage: (str: string) => void;
    __coverage__: string;
}
