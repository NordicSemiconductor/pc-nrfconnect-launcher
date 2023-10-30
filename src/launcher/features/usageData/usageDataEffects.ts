/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    usageData,
    UsageDataMetadata,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import si from 'systeminformation';

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

const EventLabel = {
    LAUNCHER_USAGE_DATA_ON: 'Usage data on',
    LAUNCHER_USAGE_DATA_OFF: 'Usage data off',
    LAUNCHER_USAGE_DATA_NOT_SET: 'Usage data not set',
};

export const isUsageDataOn = () => usageData.isEnabled();

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

const initUsageData = (label: string) => {
    usageData.sendUsageData(EventAction.LAUNCH_LAUNCHER, {
        usageData: label,
    });
};

export const checkUsageDataSetting = (): AppThunk => dispatch => {
    usageData.init();
    const isSendingUsageData = usageData.isEnabled();
    if (typeof isSendingUsageData !== 'boolean') {
        dispatch(showUsageDataDialog());
        return;
    }
    if (isSendingUsageData) {
        initUsageData(EventLabel.LAUNCHER_USAGE_DATA_ON);
        dispatch(setUsageDataOn());
        return;
    }
    dispatch(setUsageDataOff());
};

export const sendLauncherUsageData = (
    eventAction: string,
    metadata?: UsageDataMetadata
) => {
    usageData.sendUsageData(eventAction, metadata);
};

export const sendAppUsageData = (
    eventAction: string,
    metadata?: UsageDataMetadata
) => {
    usageData.sendUsageData(eventAction, metadata);
};

export const sendEnvInfo = async () => {
    const { platform, arch } = await si.osInfo();
    sendLauncherUsageData(EventAction.REPORT_OS_INFO, { platform, arch });
    sendLauncherUsageData(EventAction.REPORT_LAUNCHER_INFO, { pkgJson });
};
