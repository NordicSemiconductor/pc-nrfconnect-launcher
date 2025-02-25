/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ConfirmationDialog } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { initialiseLauncherStateStage2 } from '../initialisation/initialiseLauncherState';
import { removeSource } from './sourcesEffects';
import { getDeprecatedSources, hideDeprecatedSources } from './sourcesSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const deprecatedSources = useLauncherSelector(getDeprecatedSources);
    const isVisible = deprecatedSources.length > 0;

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Remove deprecated sources"
            cancelLabel="Ignore"
            confirmLabel="Yes, remove"
            onConfirm={async () => {
                dispatch(hideDeprecatedSources());

                await Promise.all(
                    deprecatedSources.map(source =>
                        dispatch(removeSource(source.name))
                    )
                );
                dispatch(initialiseLauncherStateStage2());
            }}
            onCancel={() => {
                dispatch(hideDeprecatedSources());
                dispatch(initialiseLauncherStateStage2());
            }}
        >
            <p>Some sources you added are no longer supported.</p>
            <p>
                We recommend removing them, otherwise you will get an error
                message each time nRF Connect for Desktop tries to update app
                informations. If you remove them, the apps installed from them
                will also be removed.
            </p>
            <p>Deprecated sources:</p>
            <ul>
                {deprecatedSources.map(source => (
                    <li key={source.url}>{source.name}</li>
                ))}
            </ul>
        </ConfirmationDialog>
    );
};
