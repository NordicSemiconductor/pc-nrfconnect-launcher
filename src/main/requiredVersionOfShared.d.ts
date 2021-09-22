/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PackageJson } from 'pc-nrfconnect-shared';

declare const requiredVersionOfShared: (
    packageJson: PackageJson
) => string | undefined;

export default requiredVersionOfShared;
