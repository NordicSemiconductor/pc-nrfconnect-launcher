/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import {
    ConfirmationDialog,
    ExternalLink,
    useFocusedOnVisible,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { setArtifactoryToken } from './settingsEffects';
import {
    getArtifactoryTokenInformation,
    getIsAddArtifactoryTokenVisible,
    hideAddArtifactoryToken,
} from './settingsSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isVisible = useLauncherSelector(getIsAddArtifactoryTokenVisible);
    const [enteredToken, setEnteredToken] = useState('');

    const ref = useFocusedOnVisible<HTMLInputElement>(isVisible);

    const hideDialog = () => dispatch(hideAddArtifactoryToken());

    const storeToken = async () => {
        setEnteredToken('');
        hideDialog();

        try {
            await dispatch(setArtifactoryToken(enteredToken));
        } catch (error) {
            /* No further error handling than already is done in setArtifactoryToken */
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
                Enter an identity token to use for retrieving apps. To get a
                token, go to{' '}
                <ExternalLink href="https://files.nordicsemi.com/ui/user_profile" />
                , log in and generate an identity token there.
            </p>
            <p>
                As Nordic employee, you should be able to log in, otherwise ask
                your Nordic contact for an account if you are eligible.
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
