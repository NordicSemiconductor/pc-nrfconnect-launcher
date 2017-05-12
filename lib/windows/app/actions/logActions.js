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

import { logger, logBuffer, logFilePath, userDataDir } from '../../../api/logging';
import { openFileInDefaultApplication } from '../../../util/fileUtil';

export const ADD_ENTRIES = 'LOG_ADD_ENTRIES';
export const OPEN_FILE = 'LOG_OPEN_FILE';
export const OPEN_FILE_SUCCESS = 'LOG_OPEN_FILE_SUCCESS';
export const OPEN_FILE_ERROR = 'LOG_OPEN_FILE_ERROR';
export const CLEAR_ENTRIES = 'LOG_CLEAR_ENTRIES';
export const TOGGLE_AUTOSCROLL = 'LOG_TOGGLE_AUTOSCROLL';

const LOG_UPDATE_INTERVAL = 400;
let logListenerTimeout;

function addEntriesAction(entries) {
    return {
        type: ADD_ENTRIES,
        entries,
    };
}

function openFileAction() {
    return {
        type: OPEN_FILE,
    };
}

function openFileSuccessAction() {
    return {
        type: OPEN_FILE_SUCCESS,
    };
}

function openFileErrorAction(message) {
    return {
        type: OPEN_FILE_ERROR,
        message,
    };
}

function clearEntriesAction() {
    return {
        type: CLEAR_ENTRIES,
    };
}

function toggleAutoScrollAction() {
    return {
        type: TOGGLE_AUTOSCROLL,
    };
}

function listenToLogUpdates(dispatch) {
    if (logBuffer.size() > 0) {
        const entries = logBuffer.clear();
        dispatch(addEntriesAction(entries));
    }

    logListenerTimeout = setTimeout(() => {
        listenToLogUpdates(dispatch);
    }, LOG_UPDATE_INTERVAL);
}

function stopLogListener() {
    if (logListenerTimeout) {
        clearTimeout(logListenerTimeout);
    }
}

export function openLogFile() {
    return dispatch => {
        dispatch(openFileAction());
        openFileInDefaultApplication(logFilePath, err => {
            if (err) {
                logger.error(`Unable to open log file: ${err.message}`);
                dispatch(openFileErrorAction(err.message));
            } else {
                dispatch(openFileSuccessAction());
            }
        });
    };
}

export function toggleAutoScroll() {
    return toggleAutoScrollAction();
}

export function clear() {
    return clearEntriesAction();
}

export function startReading() {
    return dispatch => {
        logger.info(`Application data folder: ${userDataDir}`);
        return listenToLogUpdates(dispatch);
    };
}

export function stopReading() {
    stopLogListener();
}
