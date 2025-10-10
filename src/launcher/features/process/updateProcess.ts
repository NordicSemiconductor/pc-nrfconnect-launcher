/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    describeError,
    ErrorDialogActions,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import type { AppThunk } from '../../store';
import { downloadLatestAppInfos as downloadLatestAppInfosEffect } from '../apps/appsEffects';
import { checkForJLinkUpdate as checkForJLinkUpdateEffect } from '../jlinkUpdate/jlinkUpdateEffects';
import { checkForLauncherUpdate as checkForLauncherUpdateEffect } from '../launcherUpdate/launcherUpdateEffects';
import { getIsErrorVisible as getIsProxyErrorShown } from '../proxyLogin/proxyLoginSlice';
import { showUpdateCheckComplete } from '../settings/settingsSlice';
import {
    INTERRUPT_PROCESS,
    type ProcessStep,
    runRemainingProcessStepsSequentially,
} from './thunkProcess';

const checkForJLinkUpdate: ProcessStep = async dispatch => {
    try {
        const { isUpdateAvailable } = await dispatch(
            checkForJLinkUpdateEffect({ checkOnline: true }),
        );

        if (isUpdateAvailable) {
            return INTERRUPT_PROCESS;
        }
    } catch (e) {
        dispatch(ErrorDialogActions.showDialog(describeError(e)));
    }
};

const checkForLauncherUpdate: ProcessStep = async dispatch => {
    if (process.env.NODE_ENV !== 'development') {
        const { isUpdateAvailable } = await dispatch(
            checkForLauncherUpdateEffect(),
        );

        if (isUpdateAvailable) {
            return INTERRUPT_PROCESS;
        }
    }
};

const downloadLatestAppInfo =
    (showDialogOnComplete: boolean): ProcessStep =>
    async (dispatch, getState) => {
        try {
            await dispatch(downloadLatestAppInfosEffect());
            if (showDialogOnComplete && !getIsProxyErrorShown(getState())) {
                dispatch(showUpdateCheckComplete());
            }
        } catch (error) {
            dispatch(
                ErrorDialogActions.showDialog(
                    `Unable to check for updates: ${describeError(error)}`,
                ),
            );
        }
    };

let currentProcessSteps: ProcessStep[] = [];

export const startUpdateProcess =
    (showDialogOnComplete: boolean): AppThunk =>
    dispatch => {
        currentProcessSteps = [
            checkForJLinkUpdate,
            checkForLauncherUpdate,
            downloadLatestAppInfo(showDialogOnComplete),
        ];
        dispatch(continueUpdateProcess());
    };

export const continueUpdateProcess = (): AppThunk => dispatch => {
    dispatch(runRemainingProcessStepsSequentially(currentProcessSteps));
};
