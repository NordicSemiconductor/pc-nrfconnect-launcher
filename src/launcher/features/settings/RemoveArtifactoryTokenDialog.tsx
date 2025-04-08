/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    ConfirmationDialog,
    describeError,
    ErrorDialogActions,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import cleanIpcErrorMessage from '../../../common/cleanIpcErrorMessage';
import { inMain as artifactoryToken } from '../../../ipc/artifactoryToken';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { hasRestrictedAccessLevel } from '../sources/sourcesEffects';
import { getSources } from '../sources/sourcesSlice';
import {
    getIsRemoveArtifactoryTokenVisible,
    hideRemoveArtifactoryToken,
    removeArtifactoryTokenInformation,
} from './settingsSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isVisible = useLauncherSelector(getIsRemoveArtifactoryTokenVisible);
    const nonPublicSources = useLauncherSelector(getSources).filter(source =>
        hasRestrictedAccessLevel(source.url)
    );

    const hideDialog = () => dispatch(hideRemoveArtifactoryToken());

    const removeToken = async () => {
        try {
            hideDialog();

            await artifactoryToken.removeToken();
            dispatch(removeArtifactoryTokenInformation());
        } catch (error) {
            dispatch(
                ErrorDialogActions.showDialog(
                    `Unable to remove token.`,
                    undefined,
                    cleanIpcErrorMessage(describeError(error))
                )
            );
        }
    };

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Remove token"
            confirmLabel="Remove token"
            onConfirm={removeToken}
            onCancel={hideDialog}
        >
            <p>
                After removing the identity token, you will no longer be able to
                add non-external sources from Nordic Semiconductor, until you
                set a token again.
            </p>
            {nonPublicSources.length > 0 && (
                <>
                    <p>
                        You currently have these non-external sources added.
                        Until you set an identity token again, updating these
                        sources will lead to errors and you will be unable to
                        install apps from them:
                    </p>
                    <ul>
                        {nonPublicSources.map(source => (
                            <li key={source.url}>{source.name}</li>
                        ))}
                    </ul>
                </>
            )}
        </ConfirmationDialog>
    );
};
