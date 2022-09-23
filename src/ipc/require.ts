/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { handle, invoke } from './infrastructure/rendererToMain';

const channel = 'require';

type Require = (module: string) => unknown;

export const registerRequire = handle<Require>(channel);
export const getRequire = invoke<Require>(channel);
