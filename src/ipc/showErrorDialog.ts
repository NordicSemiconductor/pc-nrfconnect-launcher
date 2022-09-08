/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as mainToRenderer from './infrastructure/mainToRenderer';

const channel = 'show-error-dialog';

type ShowErrorDialog = (errorMessage: string) => void;

export const sendFromMain = mainToRenderer.send<ShowErrorDialog>(channel);

export const registerHandlerFromRenderer =
    mainToRenderer.registerSent<ShowErrorDialog>(channel);
