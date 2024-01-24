/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    isDevelopment,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import pkgJson from '../../../../package.json';
import type { AppThunk } from '../../store';
import {
    getIsSendingUsageData,
    hideUsageDataDialog,
    setUsageDataOff,
    setUsageDataOn,
    showUsageDataDialog,
} from './telemetrySlice';

export const EventAction = {
    LAUNCH_LAUNCHER: 'Launch launcher',
    APP_MANAGEMENT: 'App Management',
    LAUNCH_APP: 'Launch app',
    REPORT_OS_INFO: 'Report OS info',
    REPORT_LAUNCHER_INFO: 'Report launcher info',
    REPORT_INSTALLATION_ERROR: 'Report installation error',
};

export const confirmSendingUsageData = (): AppThunk => dispatch => {
    telemetry.setUsersAgreedToTelemetry(true);
    dispatch(setUsageDataOn());
    dispatch(hideUsageDataDialog());
};

export const cancelSendingUsageData = (): AppThunk => dispatch => {
    telemetry.setUsersAgreedToTelemetry(false);
    dispatch(setUsageDataOff());
    dispatch(hideUsageDataDialog());
};

export const toggleSendingUsageData = (): AppThunk => (dispatch, getState) => {
    const isSendingUsageData = getIsSendingUsageData(getState());
    dispatch(hideUsageDataDialog());
    telemetry.setUsersAgreedToTelemetry(!isSendingUsageData);
    if (isSendingUsageData) {
        dispatch(setUsageDataOff());
        return;
    }
    dispatch(setUsageDataOn());
};

export const checkUsageDataSetting = (): AppThunk => dispatch => {
    const isSendingUsageData = telemetry.getIsSendingTelemetry();
    if (typeof isSendingUsageData !== 'boolean') {
        dispatch(showUsageDataDialog());
        return;
    }
    if (isSendingUsageData) {
        dispatch(setUsageDataOn());
        return;
    }
    dispatch(setUsageDataOff());
};

export const sendEnvInfo = () => {
    telemetry.sendEvent(EventAction.REPORT_LAUNCHER_INFO, {
        version: pkgJson.version,
        isDevelopment,
    });
};
