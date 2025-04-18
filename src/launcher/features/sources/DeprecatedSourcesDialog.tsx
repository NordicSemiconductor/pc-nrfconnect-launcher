/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ConfirmationDialog } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import initialiseLauncherState from '../initialisation/initialiseLauncherState';
import { removeSource } from './sourcesEffects';
import {
    doNotRemindDeprecatedSources,
    getDeprecatedSources,
    hideDeprecatedSources,
} from './sourcesSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const deprecatedSources = useLauncherSelector(getDeprecatedSources);
    const isVisible = deprecatedSources.length > 0;

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Remove deprecated sources"
            confirmLabel="Yes, remove"
            onConfirm={async () => {
                dispatch(hideDeprecatedSources());

                await Promise.all(
                    deprecatedSources.map(source =>
                        dispatch(removeSource(source.name))
                    )
                );
                dispatch(initialiseLauncherState());
            }}
            optionalLabel="Do not remind me again"
            onOptional={() => {
                dispatch(hideDeprecatedSources());
                dispatch(initialiseLauncherState());

                dispatch(doNotRemindDeprecatedSources());
            }}
            cancelLabel="Ignore"
            onCancel={() => {
                dispatch(hideDeprecatedSources());
                dispatch(initialiseLauncherState());
            }}
        >
            <p>The following sources you added are no longer supported:</p>
            <ul>
                {deprecatedSources.map(source => (
                    <li key={source.url}>{source.name}</li>
                ))}
            </ul>
            <p>
                You will get an error message each time nRF Connect for Desktop
                tries to update app information using these sources.
            </p>
            <p>
                You can remove these sources. If you do, the apps you installed
                from them will also be removed.
            </p>
        </ConfirmationDialog>
    );
};
