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

import { setDoNotRemindOnMissingToken } from '../../../common/persistedStore';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { continueLauncherInitialisation } from '../process/initialiseLauncher';
import { setArtifactoryToken } from '../settings/settingsEffects';
import { addSource } from './sourcesEffects';
import {
    getMissingTokenWarning,
    hideWarningAboutMissingToken,
    isWarningAboutMissingTokenOnAddSource,
    isWarningAboutMissingTokenOnStartup,
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

        if (isWarningAboutMissingTokenOnStartup(missingTokenWarning))
            dispatch(continueLauncherInitialisation());
    };

    const storeTokenAndAddSource = async () => {
        if (token.trim() === '' || !missingTokenWarning.isVisible) {
            return;
        }

        try {
            await dispatch(setArtifactoryToken(token.trim()));
        } catch {
            hideDialog({ doContinue: false });
            return;
        }

        if (isWarningAboutMissingTokenOnAddSource(missingTokenWarning))
            dispatch(
                addSource(missingTokenWarning.sourceToAdd, {
                    warnOnMissingToken: false,
                }),
            );

        hideDialog();
    };

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Missing token"
            confirmLabel="Set token"
            cancelLabel={
                isWarningAboutMissingTokenOnAddSource(missingTokenWarning)
                    ? 'Cancel adding source'
                    : 'Cancel'
            }
            optionalLabel={
                isWarningAboutMissingTokenOnStartup(missingTokenWarning)
                    ? 'Do not remind me again'
                    : undefined
            }
            onConfirm={storeTokenAndAddSource}
            onOptional={() => {
                setDoNotRemindOnMissingToken();
                hideDialog();
            }}
            onCancel={() => hideDialog()}
        >
            {isWarningAboutMissingTokenOnAddSource(missingTokenWarning) && (
                <p>
                    For accessing the source at the URL{' '}
                    <code>{missingTokenWarning.sourceToAdd}</code> an identity
                    token is required but you have not set one yet. Without
                    providing a token, it is not possible to add this source.
                </p>
            )}
            {isWarningAboutMissingTokenOnStartup(missingTokenWarning) && (
                <>
                    <p>
                        For accessing the following sources, an identity token
                        is required:
                    </p>
                    <ul>
                        {missingTokenWarning.sourcesWithRestrictedAccessLevel.map(
                            source => (
                                <li key={source.url}>{source.name}</li>
                            ),
                        )}
                    </ul>
                    <p>
                        Without providing a token, these sources will not be
                        updated, and trying to install apps from them will fail.
                    </p>
                </>
            )}
            <p>
                Get an identity token from the{' '}
                <ExternalLink
                    href="https://files.nordicsemi.com/ui/user_profile"
                    label="Nordic Semiconductor JFrog portal"
                />
                . Read{' '}
                <ExternalLink
                    href="https://docs.nordicsemi.com/bundle/nrf-connect-desktop/page/working_with_authentications_tokens.html#generating-a-new-token"
                    label="Working with identity tokens"
                />{' '}
                for detailed steps.
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
                Settings tab.
            </p>
        </ConfirmationDialog>
    );
};
