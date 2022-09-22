/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ConfirmationDialog } from 'pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { removeSource } from './sourcesEffects';
import {
    getIsRemoveSourceVisible,
    getSourceToRemove,
    hideRemoveSource,
} from './sourcesSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isVisible = useLauncherSelector(getIsRemoveSourceVisible);
    const sourceToRemove = useLauncherSelector(getSourceToRemove);

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Remove app source"
            text={`Are you sure to remove "${sourceToRemove}" source along with any apps installed from it?`}
            okButtonText="Yes, remove"
            cancelButtonText="Cancel"
            onOk={() => {
                dispatch(hideRemoveSource());
                dispatch(removeSource(sourceToRemove!)); // eslint-disable-line @typescript-eslint/no-non-null-assertion
            }}
            onCancel={() => dispatch(hideRemoveSource())}
        />
    );
};
