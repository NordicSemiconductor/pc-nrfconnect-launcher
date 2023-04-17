/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ConfirmationDialog } from 'pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import {
    getConfirmLaunchDialog,
    hideConfirmLaunchDialog,
} from './appDialogsSlice';
import { launch } from './appsEffects';

export default () => {
    const dispatch = useLauncherDispatch();
    const { isVisible, text, app } = useLauncherSelector(
        getConfirmLaunchDialog
    );

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Version problem"
            confirmLabel="Launch anyway"
            cancelLabel="Cancel"
            onConfirm={() => {
                dispatch(hideConfirmLaunchDialog());
                launch(app!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
            }}
            onCancel={() => dispatch(hideConfirmLaunchDialog())}
        >
            {text}
        </ConfirmationDialog>
    );
};
