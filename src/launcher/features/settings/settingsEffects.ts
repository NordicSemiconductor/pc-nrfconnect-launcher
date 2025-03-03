/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    describeError,
    ErrorDialogActions,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import cleanIpcErrorMessage from '../../../common/cleanIpcErrorMessage';
import { inMain as artifactoryToken } from '../../../ipc/artifactoryToken';
import type { AppThunk } from '../../store';
import { setArtifactoryTokenInformation } from './settingsSlice';

export const setArtifactoryToken =
    (token: string): AppThunk =>
    async dispatch => {
        let tokenInformation;
        try {
            tokenInformation = await artifactoryToken.setToken(token);
        } catch (error) {
            dispatch(
                ErrorDialogActions.showDialog(
                    `Token got rejected. Check if you entered a wrong or expired token.`,
                    undefined,
                    cleanIpcErrorMessage(describeError(error))
                )
            );
            throw error;
        }
        dispatch(setArtifactoryTokenInformation(tokenInformation));
    };
