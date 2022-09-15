/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AnyAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';

export const cancelDownload: () => ThunkAction<
    void,
    unknown,
    unknown,
    AnyAction
>;
