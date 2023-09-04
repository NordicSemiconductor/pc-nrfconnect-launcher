/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    ConfirmationDialog,
    ExternalLink,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { inMain } from '../../../ipc/launcherUpdate';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { getLauncherUpdate, reset } from './launcherUpdateSlice';

const releaseNotesUrl =
    'https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/releases';

export default () => {
    const dispatch = useLauncherDispatch();
    const {
        isUpdateAvailableDialogVisible: isVisible,
        latestVersion: version,
    } = useLauncherSelector(getLauncherUpdate);

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Update available"
            confirmLabel="Yes"
            cancelLabel="No"
            onConfirm={() => inMain.startUpdate()}
            onCancel={() => dispatch(reset())}
        >
            <p>
                A new version ({version}) of nRF Connect for Desktop is
                available. Would you like to update now?
            </p>
            <div className="tw-text-sm">
                <ExternalLink
                    label="Click to see release notes"
                    href={releaseNotesUrl}
                />
            </div>
        </ConfirmationDialog>
    );
};
