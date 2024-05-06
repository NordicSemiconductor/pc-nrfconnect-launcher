/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    DialogButton,
    ExternalLink,
    GenericDialog,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { getIsTelemetryDialogVisible } from '../telemetry/telemetrySlice';
import { confirm, doNotShowAgain } from './appleSiliconEffects';
import { getIsAppleSiliconDialogVisible } from './appleSiliconSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isAppleSiliconDialogVisible = useLauncherSelector(
        getIsAppleSiliconDialogVisible
    );

    const isTelemetryDialogVisible = useLauncherSelector(
        getIsTelemetryDialogVisible
    );

    const isVisible = !isTelemetryDialogVisible && isAppleSiliconDialogVisible;

    return (
        <GenericDialog
            closeOnEsc
            headerIcon="alert"
            className="tw-preflight"
            isVisible={isVisible}
            onHide={() => dispatch(confirm())}
            title="Unsupported - Intel Build on Apple Silicon"
            footer={
                <>
                    <DialogButton
                        variant="primary"
                        onClick={() => dispatch(confirm())}
                    >
                        OK
                    </DialogButton>
                    <DialogButton onClick={() => dispatch(doNotShowAgain())}>
                        {`Don't show this again`}
                    </DialogButton>
                </>
            }
        >
            <div className="">
                <p>
                    nRF Connect for Desktop is now available natively for Apple
                    Silicon. Click on this{' '}
                    <ExternalLink
                        label="link"
                        href="https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/releases/latest"
                    />{' '}
                    to download the latest version. This is the only support way
                    to use nRF Connect for Desktop on Apple Silicon machines.
                </p>
            </div>
        </GenericDialog>
    );
};
