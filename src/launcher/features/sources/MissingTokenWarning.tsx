/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Form from 'react-bootstrap/Form';
import {
    ConfirmationDialog,
    ExternalLink,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { setArtifactoryToken } from '../settings/settingsEffects';
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

    const storeTokenAndAddSource = async () => {
        if (token.trim() === '') {
            return;
        }

        dispatch(hideWarningAboutMissingToken());
        setToken('');

        try {
            await dispatch(setArtifactoryToken(token.trim()));
        } catch (error) {
            return;
        }

        dispatch(addSource(sourceToAdd!)); // eslint-disable-line @typescript-eslint/no-non-null-assertion -- If sourceToAdd is null, the whole dialog would not be visible
    };

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Missing token"
            confirmLabel="Set token"
            onConfirm={storeTokenAndAddSource}
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
            <Form onSubmit={storeTokenAndAddSource} className="tw-pb-4">
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
