/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { usageData } from 'pc-nrfconnect-shared';
import si from 'systeminformation';

import pkgJson from '../../../package.json';

export const USAGE_DATA_DIALOG_SHOW = 'USAGE_DATA_DIALOG_SHOW';
export const USAGE_DATA_DIALOG_HIDE = 'USAGE_DATA_DIALOG_HIDE';
export const USAGE_DATA_SEND_ON = 'USAGE_DATA_SEND_ON';
export const USAGE_DATA_SEND_OFF = 'USAGE_DATA_SEND_OFF';
export const USAGE_DATA_SEND_RESET = 'USAGE_DATA_SEND_RESET';

export const EventCategory = pkgJson.name || 'Launcher';

export const EventAction = {
    LAUNCH_LAUNCHER: 'Launch launcher',
    INSTALL_APP: 'Install app',
    LAUNCH_APP: 'Launch app',
    REMOVE_APP: 'Remove app',
    UPGRADE_APP: 'Upgrade app',
    REPORT_OS_INFO: 'Report OS info',
    REPORT_LAUNCHER_INFO: 'Report launcher info',
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

export function confrimSendingUsageData() {
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
    usageData.sendEvent(EventCategory, EventAction.LAUNCH_LAUNCHER, label);
}

export function checkUsageDataSetting() {
    return async dispatch => {
        await usageData.init(EventCategory);
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
    return (_, getState) => {
        const { isSendingUsageData } = getState().settings;
        if (!isSendingUsageData) {
            return;
        }
        usageData.sendEvent(EventCategory, eventAction, eventLabel);
    };
}

export function sendAppUsageData(
    eventAction,
    eventLabel = null,
    appName = null
) {
    return () => {
        const updatedEventAction = appName
            ? `${eventAction} ${appName}`
            : eventAction;
        usageData.sendEvent(EventCategory, updatedEventAction, eventLabel);
    };
}

export function sendEnvInfo() {
    return async dispatch => {
        const [{ platform, arch }] = await Promise.all([si.osInfo()]);
        const osInfo = `${platform}; ${arch}`;
        dispatch(sendLauncherUsageData(EventAction.REPORT_OS_INFO, osInfo));
        const launcherInfo = pkgJson.version ? `v${pkgJson.version}` : '';
        dispatch(
            sendLauncherUsageData(
                EventAction.REPORT_LAUNCHER_INFO,
                launcherInfo
            )
        );
    };
}
