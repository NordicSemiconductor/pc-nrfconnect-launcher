/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { usageData } from 'pc-nrfconnect-shared';
import si from 'systeminformation';

import pkgJson from '../../../../package.json';
import type { AppDispatch, RootState } from '../../store';
import {
    getIsSendingUsageData,
    hideUsageDataDialog,
    setUsageDataOff,
    setUsageDataOn,
    showUsageDataDialog,
} from './usageDataSlice';

export const EventAction = {
    LAUNCH_LAUNCHER: 'Launch launcher',
    INSTALL_APP: 'Install app',
    INSTALL_APP_OLD_VERSION: 'Install app - old version',
    LAUNCH_APP: 'Launch app',
    REMOVE_APP: 'Remove app',
    UPDATE_APP: 'Update app',
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

export const confirmSendingUsageData = () => (dispatch: AppDispatch) => {
    usageData.enable();
    dispatch(setUsageDataOn());
    dispatch(hideUsageDataDialog());
};

export const cancelSendingUsageData = () => (dispatch: AppDispatch) => {
    usageData.disable();
    dispatch(setUsageDataOff());
    dispatch(hideUsageDataDialog());
};

export const toggleSendingUsageData =
    () => (dispatch: AppDispatch, getState: () => RootState) => {
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
    usageData.sendUsageData(EventAction.LAUNCH_LAUNCHER, label);
};

export const checkUsageDataSetting = () => (dispatch: AppDispatch) => {
    usageData.init(pkgJson);
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
    eventLabel: string | null
) => {
    usageData.sendUsageData(eventAction, eventLabel ?? undefined);
};

export const sendAppUsageData = (
    eventAction: string,
    eventLabel: string | null = null,
    appName: string | null = null
) => {
    const updatedEventAction = appName
        ? `${eventAction} ${appName}`
        : eventAction;
    usageData.sendUsageData(updatedEventAction, eventLabel ?? undefined);
};

export const sendEnvInfo = async () => {
    const [{ platform, arch }] = await Promise.all([si.osInfo()]);
    const osInfo = `${platform}; ${arch}`;
    sendLauncherUsageData(EventAction.REPORT_OS_INFO, osInfo);
    const launcherInfo = pkgJson.version ? `v${pkgJson.version}` : '';
    sendLauncherUsageData(EventAction.REPORT_LAUNCHER_INFO, launcherInfo);
};
