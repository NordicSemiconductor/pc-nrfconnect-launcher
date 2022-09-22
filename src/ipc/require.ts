/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { handle } from './infrastructure/rendererToMain';

const channel = 'require';

type Require = (module: string, defaultValue?: unknown) => unknown;

export const registerRequire = handle<Require>(channel);
