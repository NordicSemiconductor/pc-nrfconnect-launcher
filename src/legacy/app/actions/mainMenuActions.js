/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcRenderer } from 'electron';
import { systemReport } from 'pc-nrfconnect-shared';

/**
 * Indicates that opening the nRF Connect app launcher has been requested.
 *
 * @deprecated
 */
export const OPEN_APP_LAUNCHER = 'MAIN_MENU_OPEN_APP_LAUNCHER';
export const GENERATE_SYSTEM_REPORT = 'GENERATE_SYSTEM_REPORT';

function openAppLauncherAction() {
    return {
        type: OPEN_APP_LAUNCHER,
    };
}

function generateSystemReportAction() {
    return {
        type: GENERATE_SYSTEM_REPORT,
    };
}

export function openAppLauncher() {
    return dispatch => {
        dispatch(openAppLauncherAction());
        ipcRenderer.send('open-app-launcher');
    };
}

export function showAboutDialog() {
    return () => {
        ipcRenderer.send('show-about-dialog');
    };
}

export function generateSystemReport() {
    return (dispatch, getState) => {
        dispatch(generateSystemReportAction());

        const deviceState = getState().core.device;
        const allDevices = deviceState.devices;
        const currentSerialNumber = deviceState.selectedSerialNumber;
        const currentDevice = deviceState.deviceInfo;

        return systemReport(allDevices, currentSerialNumber, currentDevice);
    };
}
