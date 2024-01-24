/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ConfirmationDialog } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import {
    cancelSendingTelemetry,
    confirmSendingTelemetry,
} from './telemetryEffects';
import { getIsTelemetryDialogVisible } from './telemetrySlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isVisible = useLauncherSelector(getIsTelemetryDialogVisible);

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Help us improve nRF Connect for Desktop"
            confirmLabel="Accept"
            cancelLabel="Decline"
            onConfirm={() => dispatch(confirmSendingTelemetry())}
            onCancel={() => dispatch(cancelSendingTelemetry())}
        >
            <div className="user-data-policy">
                <p>
                    You can help improve nRF Connect for Desktop by sending
                    Nordic Semiconductor anonymous statistics on how you
                    interact with the app. You can enable/disable this feature
                    at any time in Settings.
                </p>
                <h5>What kind of information do we collect?</h5>
                <p>
                    Anonymous aggregation of software and operational info
                    including:
                </p>
                <ul>
                    <li>Launcher, app, and module version</li>
                    <li>Installing, launching, and removing apps</li>
                    <li>
                        App operations such as selecting and using the device
                    </li>
                </ul>
                <p>
                    Anonymous system information such as which operating system
                    is used.
                </p>
                <p>
                    Anonymous device information including device and chip type,
                    but not identifying information like serial number.
                </p>
                <h5>How do we use this information?</h5>
                <p>
                    The information is used to analyze user interaction with nRF
                    Connect for Desktop and determine areas of improvement.
                </p>

                <h5>How is this information processed and shared?</h5>
                <p>
                    Microsoft Azure is used for collecting and processing the
                    data. All data collected is anonymous and no personal data
                    is ever collected.
                </p>
                <p>
                    We do not share the data to any third-party companies or
                    individuals other than Microsoft Azure.
                </p>
            </div>
        </ConfirmationDialog>
    );
};
