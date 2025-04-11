/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ConfirmationDialog } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { migrateURL } from '../../../common/legacySource';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { addSource } from './sourcesEffects';
import { clearSourceToAdd, getSourceToAdd } from './sourcesSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const sourceToAdd = useLauncherSelector(getSourceToAdd);
    const isVisible = sourceToAdd != null;

    const correctedUrl = migrateURL(sourceToAdd ?? '');

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Adding a legacy source"
            onConfirm={() => {
                dispatch(clearSourceToAdd());
                dispatch(addSource(correctedUrl));
            }}
            onCancel={() => {
                dispatch(clearSourceToAdd());
            }}
        >
            <p>
                Adding sources from <code>developer.nordisemi.com</code> is no
                longer supported.
            </p>
            <p>
                For the URL you've provided {/* <code>{sourceToAdd}</code> */},
                the app will use <code>{correctedUrl}</code> as the source.
            </p>
        </ConfirmationDialog>
    );
};
