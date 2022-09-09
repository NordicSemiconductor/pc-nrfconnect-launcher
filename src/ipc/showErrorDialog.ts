/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { on, send } from './infrastructure/mainToRenderer';

const channel = 'show-error-dialog';

type ShowErrorDialog = (errorMessage: string) => void;

export const sendFromMain = send<ShowErrorDialog>(channel);

export const registerHandlerFromRenderer = on<ShowErrorDialog>(channel);
