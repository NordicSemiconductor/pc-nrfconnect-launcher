/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { on, send } from './infrastructure/mainToRenderer';

const channel = 'show-error-dialog';

type ShowErrorDialog = (errorMessage: string) => void;

export const showErrorDialog = send<ShowErrorDialog>(channel);
export const registerShowErrorDialog = on<ShowErrorDialog>(channel);
