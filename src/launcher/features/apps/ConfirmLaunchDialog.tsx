/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ConfirmationDialog } from 'pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { launch } from './appsEffects';
import { getConfirmLaunch, hideConfirmLaunchDialog } from './appsSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const { isDialogVisible, text, app } =
        useLauncherSelector(getConfirmLaunch);

    return (
        <ConfirmationDialog
            isVisible={isDialogVisible}
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
