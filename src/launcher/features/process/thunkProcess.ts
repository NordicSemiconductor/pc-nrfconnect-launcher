/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AppThunk } from '../../store';

export const INTERRUPT_PROCESS = Symbol('interrupt process');

export type ProcessStep = AppThunk<
    | unknown
    | typeof INTERRUPT_PROCESS
    | Promise<unknown | typeof INTERRUPT_PROCESS>
>;

export const runRemainingProcessStepsSequentially =
    (processSteps: ProcessStep[]): AppThunk =>
    async dispatch => {
        while (processSteps.length > 0) {
            const action = processSteps.shift()!; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- Must be non-null because of the check above

            const result = await dispatch(action); // eslint-disable-line no-await-in-loop -- Must be awaited because some actions are asynchronous

            if (result === INTERRUPT_PROCESS) {
                return;
            }
        }
    };
