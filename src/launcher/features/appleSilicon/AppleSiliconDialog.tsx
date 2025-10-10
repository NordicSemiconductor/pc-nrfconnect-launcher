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
    openWindow,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { getIsTelemetryDialogVisible } from '../telemetry/telemetrySlice';
import { doNotShowAgain, download, ignore } from './appleSiliconEffects';
import { getIsAppleSiliconDialogVisible } from './appleSiliconSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isAppleSiliconDialogVisible = useLauncherSelector(
        getIsAppleSiliconDialogVisible,
    );

    const isTelemetryDialogVisible = useLauncherSelector(
        getIsTelemetryDialogVisible,
    );

    const isVisible = !isTelemetryDialogVisible && isAppleSiliconDialogVisible;

    return (
        <GenericDialog
            closeOnEsc
            headerIcon="alert"
            className="tw-preflight"
            isVisible={isVisible}
            onHide={() => dispatch(ignore())}
            title="Unsupported - Intel Build on Apple Silicon"
            footer={
                <>
                    <DialogButton
                        variant="primary"
                        onClick={() => {
                            openWindow.openUrl(
                                'https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/releases/latest',
                            );
                            dispatch(download());
                        }}
                    >
                        Download
                    </DialogButton>
                    <DialogButton onClick={() => dispatch(ignore())}>
                        Ignore
                    </DialogButton>
                    <DialogButton onClick={() => dispatch(doNotShowAgain())}>
                        {`Don't show again`}
                    </DialogButton>
                </>
            }
        >
            <div>
                <p>
                    nRF Connect for Desktop is now available natively for Apple
                    Silicon.{' '}
                    <ExternalLink
                        label="Download the latest version of the launcher"
                        href="https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/releases/latest"
                    />
                    . This is the only supported way to use nRF Connect for
                    Desktop on Apple Silicon machines.
                </p>
            </div>
        </GenericDialog>
    );
};
