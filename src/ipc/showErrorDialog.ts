/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    on,
    send,
} from 'pc-nrfconnect-shared/ipc/infrastructure/mainToRenderer';

const channel = 'show-error-dialog';

type ShowErrorDialog = (errorMessage: string) => void;

const showErrorDialog = send<ShowErrorDialog>(channel);
const registerShowErrorDialog = on<ShowErrorDialog>(channel);

export const forMain = { registerShowErrorDialog };
export const inRenderer = { showErrorDialog };
