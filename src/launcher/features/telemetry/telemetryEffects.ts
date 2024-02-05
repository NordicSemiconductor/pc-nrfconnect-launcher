/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    isDevelopment,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { getHasUserAgreedToTelemetry } from '@nordicsemiconductor/pc-nrfconnect-shared/src/utils/persistentStore';

import pkgJson from '../../../../package.json';
import type { AppThunk } from '../../store';
import {
    getIsSendingTelemetry,
    hideTelemetryDialog,
    setIsSendingTelemetry,
    showTelemetryDialog,
} from './telemetrySlice';

export const EventAction = {
    LAUNCH_LAUNCHER: 'Launch launcher',
    APP_MANAGEMENT: 'App Management',
    LAUNCH_APP: 'Launch app',
    REPORT_OS_INFO: 'Report OS info',
    REPORT_LAUNCHER_INFO: 'Report launcher info',
    REPORT_INSTALLATION_ERROR: 'Report installation error',
};

export const confirmSendingTelemetry = (): AppThunk => dispatch => {
    telemetry.setUsersAgreedToTelemetry(true);
    dispatch(setIsSendingTelemetry(true));
    dispatch(hideTelemetryDialog());
};

export const cancelSendingTelemetry = (): AppThunk => (dispatch, getState) => {
    if (getIsSendingTelemetry(getState())) {
        telemetry.setUsersAgreedToTelemetry(false);
        dispatch(setIsSendingTelemetry(false));
    }
    dispatch(hideTelemetryDialog());
};

export const toggleSendingTelemetry = (): AppThunk => (dispatch, getState) => {
    const isSendingTelemetry = getIsSendingTelemetry(getState());
    dispatch(hideTelemetryDialog());
    telemetry.setUsersAgreedToTelemetry(!isSendingTelemetry);
    dispatch(setIsSendingTelemetry(!isSendingTelemetry));
};

export const checkTelemetrySetting = (): AppThunk => dispatch => {
    if (getHasUserAgreedToTelemetry == null) {
        dispatch(showTelemetryDialog());
        return;
    }

    dispatch(setIsSendingTelemetry(telemetry.getIsSendingTelemetry()));
};

export const sendEnvInfo = () => {
    telemetry.sendEvent(EventAction.REPORT_LAUNCHER_INFO, {
        version: pkgJson.version,
        isDevelopment,
    });
};
