/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Form from 'react-bootstrap/Form';
import {
    ConfirmationDialog,
    ErrorDialogActions,
    ExternalLink,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import cleanIpcErrorMessage from '../../../common/cleanIpcErrorMessage';
import { inMain as artifactoryToken } from '../../../ipc/artifactoryToken';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { setArtifactoryTokenInformation } from '../settings/settingsSlice';
import { addSource } from './sourcesEffects';
import {
    getSourceToWarnAbout,
    hideWarningAboutMissingToken,
} from './sourcesSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const sourceToAdd = useLauncherSelector(getSourceToWarnAbout);
    const isVisible = sourceToAdd != null;

    const [token, setToken] = React.useState('');

    const confirm = async () => {
        if (token.trim() === '') {
            return;
        }

        dispatch(hideWarningAboutMissingToken());
        setToken('');

        let tokenInformation;
        try {
            tokenInformation = await artifactoryToken.setToken(token.trim());
        } catch (error) {
            dispatch(
                ErrorDialogActions.showDialog(
                    `Token got rejected. Check if you entered a wrong or expired token.`,
                    undefined,
                    cleanIpcErrorMessage(describeError(error))
                )
            );
            return;
        }
        dispatch(setArtifactoryTokenInformation(tokenInformation));

        dispatch(addSource(sourceToAdd!)); // eslint-disable-line @typescript-eslint/no-non-null-assertion -- If sourceToAdd is null, the whole dialog would not be visible
    };

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Missing token"
            confirmLabel="Set token"
            onConfirm={confirm}
            onCancel={() => {
                dispatch(hideWarningAboutMissingToken());
                setToken('');
            }}
        >
            <p>
                For accessing the source at the URL <code>{sourceToAdd}</code>{' '}
                an Artifactory token is required but you have not set one yet.
                Without providing a token, using the source will fail.
            </p>
            <p>
                To get a token, go to{' '}
                <ExternalLink href="https://files.nordicsemi.com/ui/user_profile" />
                , log in and generate an Identity Token there. As Nordic
                employee, you should be able to log in, otherwise ask your
                Nordic contact for an account if you are eligible.
            </p>
            <p className="tw-m-0">Paste the token here:</p>
            <Form onSubmit={confirm} className="tw-pb-4">
                <Form.Control
                    value={token}
                    onChange={event => setToken(event.target.value)}
                />
            </Form>
            <p>
                You can also later view, remove, or set the token in the
                settings.
            </p>
        </ConfirmationDialog>
    );
};
