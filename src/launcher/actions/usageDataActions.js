/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { usageData } from 'pc-nrfconnect-shared';
import si from 'systeminformation';

import pkgJson from '../../../package.json';

export const USAGE_DATA_DIALOG_SHOW = 'USAGE_DATA_DIALOG_SHOW';
export const USAGE_DATA_DIALOG_HIDE = 'USAGE_DATA_DIALOG_HIDE';
export const USAGE_DATA_SEND_ON = 'USAGE_DATA_SEND_ON';
export const USAGE_DATA_SEND_OFF = 'USAGE_DATA_SEND_OFF';
export const USAGE_DATA_SEND_RESET = 'USAGE_DATA_SEND_RESET';

export const EventAction = {
    LAUNCH_LAUNCHER: 'Launch launcher',
    INSTALL_APP: 'Install app',
    LAUNCH_APP: 'Launch app',
    REMOVE_APP: 'Remove app',
    UPGRADE_APP: 'Upgrade app',
    REPORT_OS_INFO: 'Report OS info',
    REPORT_LAUNCHER_INFO: 'Report launcher info',
    REPORT_INSTALLATION_ERROR: 'Report installation error',
};

const EventLabel = {
    LAUNCHER_USAGE_DATA_ON: 'Usage data on',
    LAUNCHER_USAGE_DATA_OFF: 'Usage data off',
    LAUNCHER_USAGE_DATA_NOT_SET: 'Usage data not set',
};

export function showUsageDataDialog() {
    return {
        type: USAGE_DATA_DIALOG_SHOW,
    };
}

export function hideUsageDataDialog() {
    return {
        type: USAGE_DATA_DIALOG_HIDE,
    };
}

export function setUsageDataOn() {
    return {
        type: USAGE_DATA_SEND_ON,
    };
}

export function setUsageDataOff() {
    return {
        type: USAGE_DATA_SEND_OFF,
    };
}

export function resetUsageData() {
    usageData.reset();
    return {
        type: USAGE_DATA_SEND_RESET,
    };
}

export function isUsageDataOn() {
    return usageData.isEnabled();
}

export function confirmSendingUsageData() {
    return dispatch => {
        usageData.enable();
        dispatch(setUsageDataOn());
        dispatch(hideUsageDataDialog());
    };
}

export function cancelSendingUsageData() {
    return dispatch => {
        usageData.disable();
        dispatch(setUsageDataOff());
        dispatch(hideUsageDataDialog());
    };
}

export function toggleSendingUsageData() {
    return (dispatch, getState) => {
        const { isSendingUsageData } = getState().settings;
        dispatch(hideUsageDataDialog());
        if (isSendingUsageData) {
            usageData.disable();
            dispatch(setUsageDataOff());
            return;
        }
        usageData.enable();
        dispatch(setUsageDataOn());
    };
}

function initUsageData(label) {
    usageData.sendUsageData(EventAction.LAUNCH_LAUNCHER, label);
}

export function checkUsageDataSetting() {
    return async dispatch => {
        await usageData.init(pkgJson);
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
}

export function sendLauncherUsageData(eventAction, eventLabel) {
    usageData.sendUsageData(eventAction, eventLabel);
}

export function sendAppUsageData(
    eventAction,
    eventLabel = null,
    appName = null
) {
    const updatedEventAction = appName
        ? `${eventAction} ${appName}`
        : eventAction;
    usageData.sendUsageData(updatedEventAction, eventLabel);
}

export async function sendEnvInfo() {
    const [{ platform, arch }] = await Promise.all([si.osInfo()]);
    const osInfo = `${platform}; ${arch}`;
    sendLauncherUsageData(EventAction.REPORT_OS_INFO, osInfo);
    const launcherInfo = pkgJson.version ? `v${pkgJson.version}` : '';
    sendLauncherUsageData(EventAction.REPORT_LAUNCHER_INFO, launcherInfo);
}
