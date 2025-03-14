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
import initialiseLauncherState from '../initialisation/initialiseLauncherState';
import { setArtifactoryToken } from '../settings/settingsEffects';
import { addSource } from './sourcesEffects';
import {
    getMissingTokenWarning,
    hideWarningAboutMissingToken,
    isWarningAboutMissingTokenOnAddSource,
    isWarningAboutMissingTokenOnMigratingSources,
} from './sourcesSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const missingTokenWarning = useLauncherSelector(getMissingTokenWarning);
    const isVisible = missingTokenWarning.isVisible;

    const [token, setToken] = React.useState('');

    const hideDialog = ({ doContinue } = { doContinue: true }) => {
        dispatch(hideWarningAboutMissingToken());
        setToken('');

        if (!doContinue) {
            return;
        }

        if (isWarningAboutMissingTokenOnAddSource(missingTokenWarning))
            dispatch(
                addSource(missingTokenWarning.sourceToAdd, {
                    warnOnMissingToken: false,
                })
            );

        if (isWarningAboutMissingTokenOnMigratingSources(missingTokenWarning))
            dispatch(initialiseLauncherState());
    };

    const storeTokenAndAddSource = async () => {
        if (token.trim() === '' || !missingTokenWarning.isVisible) {
            return;
        }

        try {
            await dispatch(setArtifactoryToken(token.trim()));
        } catch (error) {
            hideDialog({ doContinue: false });
            return;
        }

        hideDialog();
    };

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Missing token"
            confirmLabel="Set token"
            onConfirm={storeTokenAndAddSource}
            onCancel={() => hideDialog()}
        >
            {isWarningAboutMissingTokenOnAddSource(missingTokenWarning) && (
                <p>
                    For accessing the source at the URL{' '}
                    <code>{missingTokenWarning.sourceToAdd}</code> an
                    Artifactory token is required but you have not set one yet.
                    Without providing a token, using the source will fail.
                </p>
            )}
            {isWarningAboutMissingTokenOnMigratingSources(
                missingTokenWarning
            ) && (
                <>
                    <p>
                        For accessing the following sources, an Artifactory
                        token is now required. Without providing a token, using
                        the source will fail.
                    </p>
                    <ul>
                        {missingTokenWarning.sourcesWithRestrictedAccessLevel.map(
                            source => (
                                <li key={source.url}>{source.name}</li>
                            )
                        )}
                    </ul>
                </>
            )}
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
