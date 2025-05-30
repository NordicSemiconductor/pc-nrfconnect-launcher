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
        if (enteredToken.trim() === '') return;

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
                To access restricted app sources from Nordic Semiconductor, get
                an identity token from the{' '}
                <ExternalLink
                    href="https://files.nordicsemi.com/ui/user_profile"
                    label="Nordic Semiconductor JFrog portal"
                />
                . Read{' '}
                <ExternalLink
                    href="https://docs.nordicsemi.com/bundle/nrf-connect-desktop/page/working_with_authentications_tokens.html"
                    label="Working with identity tokens"
                />{' '}
                for detailed steps.
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
