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

import { remote } from 'electron';
import { userData } from 'pc-nrfconnect-shared';
import pkgJson from '../../../package.json';

const settings = remote.require('../main/settings');

export const USER_DATA_DIALOG_SHOW = 'USER_DATA_DIALOG_SHOW';
export const USER_DATA_DIALOG_HIDE = 'USER_DATA_DIALOG_HIDE';
export const USER_DATA_SEND_ON = 'USER_DATA_SEND_ON';
export const USER_DATA_SEND_OFF = 'USER_DATA_SEND_OFF';

export const EventCategory = pkgJson.name || 'Launcher';

export const EventAction = {
    LAUNCH_LAUNCHER: 'Launch launcher',
    INSTALL_APP: 'Install app',
    LAUNCH_APP: 'Launch app',
    REMOVE_APP: 'Remove app',
    UPGRADE_APP: 'Upgrade app',
};

const EventLabel = {
    LAUNCHER_USER_DATA_ON: 'User data on',
    LAUNCHER_USER_DATA_OFF: 'User data off',
    LAUNCHER_USER_DATA_NOT_SET: 'User data not set',
};

export function showUserDataDialog() {
    return {
        type: USER_DATA_DIALOG_SHOW,
    };
}

export function hideUserDataDialog() {
    return {
        type: USER_DATA_DIALOG_HIDE,
    };
}

export function setUserDataOn() {
    return {
        type: USER_DATA_SEND_ON,
    };
}

export function setUserDataOff() {
    return {
        type: USER_DATA_SEND_OFF,
    };
}

export function confrimSendingUserData() {
    return dispatch => {
        settings.set('isSendingUserData', true);
        dispatch(setUserDataOn());
    };
}

export function toggleSendingUserData() {
    return (dispatch, getState) => {
        const { isSendingUserData } = getState().settings;
        dispatch(hideUserDataDialog());
        if (isSendingUserData) {
            settings.set('isSendingUserData', false);
            dispatch(setUserDataOff());
            return;
        }
        settings.set('isSendingUserData', true);
        dispatch(setUserDataOn());
    };
}

function initUserData(label) {
    userData.sendEvent(
        EventCategory,
        EventAction.LAUNCH_LAUNCHER,
        label,
    );
}

export function checkUserDataSetting(isSendingUserData) {
    return async dispatch => {
        await userData.init(EventCategory);
        if (isSendingUserData) {
            initUserData(EventLabel.LAUNCHER_USER_DATA_ON);
            dispatch(setUserDataOn());
            return;
        }
        if (isSendingUserData === null) {
            dispatch(showUserDataDialog());
            initUserData(EventLabel.LAUNCHER_USER_DATA_NOT_SET);
            return;
        }
        initUserData(EventLabel.LAUNCHER_USER_DATA_OFF);
        dispatch(setUserDataOff());
    };
}

export function sendLauncherUserData(eventAction, eventLabel = null, appName = null) {
    return (_, getState) => {
        const { isSendingUserData } = getState().settings;
        if (!isSendingUserData) {
            return;
        }
        const updatedEventAction = appName ? `${eventAction} ${appName}` : eventAction;
        userData.sendEvent(
            EventCategory,
            updatedEventAction,
            eventLabel,
        );
    };
}
