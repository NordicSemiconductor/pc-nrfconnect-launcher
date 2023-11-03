/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    isDevelopment,
    usageData,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import pkgJson from '../../../../package.json';
import type { AppThunk } from '../../store';
import {
    getIsSendingUsageData,
    hideUsageDataDialog,
    setUsageDataOff,
    setUsageDataOn,
    showUsageDataDialog,
} from './usageDataSlice';

export const EventAction = {
    LAUNCH_LAUNCHER: 'Launch launcher',
    APP_MANAGEMENT: 'App Management',
    LAUNCH_APP: 'Launch app',
    REPORT_OS_INFO: 'Report OS info',
    REPORT_LAUNCHER_INFO: 'Report launcher info',
    REPORT_INSTALLATION_ERROR: 'Report installation error',
};

export const confirmSendingUsageData = (): AppThunk => dispatch => {
    usageData.enable();
    dispatch(setUsageDataOn());
    dispatch(hideUsageDataDialog());
};

export const cancelSendingUsageData = (): AppThunk => dispatch => {
    usageData.disable();
    dispatch(setUsageDataOff());
    dispatch(hideUsageDataDialog());
};

export const toggleSendingUsageData = (): AppThunk => (dispatch, getState) => {
    const isSendingUsageData = getIsSendingUsageData(getState());
    dispatch(hideUsageDataDialog());
    if (isSendingUsageData) {
        usageData.disable();
        dispatch(setUsageDataOff());
        return;
    }
    usageData.enable();
    dispatch(setUsageDataOn());
};

export const checkUsageDataSetting = (): AppThunk => dispatch => {
    const isSendingUsageData = usageData.isEnabled();
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
    usageData.sendUsageData(EventAction.REPORT_LAUNCHER_INFO, {
        version: pkgJson.version,
        isDevelopment,
    });
};
