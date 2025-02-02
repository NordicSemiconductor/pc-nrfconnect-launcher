/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import {
    ConfirmationDialog,
    ErrorDialogActions,
    ExternalLink,
    useFocusedOnVisible,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import { inMain as artifactoryToken } from '../../../ipc/artifactoryToken';
import { cleanIpcErrorMessage } from '../../../ipc/error';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import {
    getArtifactoryTokenInformation,
    getIsAddArtifactoryTokenVisible,
    hideAddArtifactoryToken,
    setArtifactoryTokenInformation,
} from './settingsSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isVisible = useLauncherSelector(getIsAddArtifactoryTokenVisible);
    const [enteredToken, setEnteredToken] = useState('');

    const ref = useFocusedOnVisible<HTMLInputElement>(isVisible);

    const hideDialog = () => dispatch(hideAddArtifactoryToken());

    const storeToken = async () => {
        try {
            const tokenInformation = await artifactoryToken.setToken(
                enteredToken
            );

            setEnteredToken('');
            dispatch(setArtifactoryTokenInformation(tokenInformation));
            hideDialog();
        } catch (error) {
            setEnteredToken('');
            hideDialog();

            dispatch(
                ErrorDialogActions.showDialog(
                    `Token got rejected. Check if you entered a wrong or expired token.`,
                    undefined,
                    cleanIpcErrorMessage(describeError(error))
                )
            );
        }
    };

    const hasToken =
        useLauncherSelector(getArtifactoryTokenInformation) != null;

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title={hasToken ? 'Replace token' : 'Set token'}
            confirmLabel={hasToken ? 'Replace' : 'Set'}
            onConfirm={storeToken}
            onCancel={hideDialog}
        >
            <p>
                Enter an Artifactory token to use for retrieving apps. You can
                get an identity token from{' '}
                <ExternalLink href="https://files.nordicsemi.com/ui/user_profile" />
                .
            </p>
            {hasToken && (
                <p>The current token will be forgotten by this app.</p>
            )}
            <Form onSubmit={storeToken}>
                <Form.Control
                    ref={ref}
                    value={enteredToken}
                    onChange={event => setEnteredToken(event.target.value)}
                />
            </Form>
        </ConfirmationDialog>
    );
};
