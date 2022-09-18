/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ConfirmationDialog } from 'pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { removeSource } from './settingsEffects';
import { getSettings, hideRemoveSourceDialog } from './settingsSlice';

export default () => {
    const { removeSource: source, isRemoveSourceDialogVisible: isVisible } =
        useLauncherSelector(getSettings);
    const dispatch = useLauncherDispatch();

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Remove app source"
            text={`Are you sure to remove "${source}" source along with any apps installed from it?`}
            okButtonText="Yes, remove"
            cancelButtonText="Cancel"
            onOk={() => {
                dispatch(hideRemoveSourceDialog());
                dispatch(removeSource(source!)); // eslint-disable-line @typescript-eslint/no-non-null-assertion
            }}
            onCancel={() => dispatch(hideRemoveSourceDialog())}
        />
    );
};
