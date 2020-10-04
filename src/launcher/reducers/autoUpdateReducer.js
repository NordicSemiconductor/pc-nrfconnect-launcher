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

import { Record } from 'immutable';
import * as AutoUpdateActions from '../actions/autoUpdateActions';

const InitialState = Record({
    isUpdateAvailableDialogVisible: false,
    isUpdateProgressDialogVisible: false,
    isProgressSupported: false,
    isCancelSupported: false,
    latestVersion: '',
    percentDownloaded: 0,
    isCancelling: false,
});
const initialState = new InitialState();

function setUpdateAvailable(state, version) {
    return state
        .set('latestVersion', version)
        .set('isUpdateAvailableDialogVisible', true);
}

function setDownloading(state, action) {
    return state
        .set('isUpdateAvailableDialogVisible', false)
        .set('isUpdateProgressDialogVisible', true)
        .set('isProgressSupported', !!action.isProgressSupported)
        .set('isCancelSupported', !!action.isCancelSupported);
}

function setPercentDownloadedAsInteger(state, percentDownloaded) {
    return state.set('percentDownloaded', parseInt(percentDownloaded, 10));
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case AutoUpdateActions.AUTO_UPDATE_AVAILABLE:
            return setUpdateAvailable(state, action.version);
        case AutoUpdateActions.AUTO_UPDATE_POSTPONE:
            return state.set('isUpdateAvailableDialogVisible', false);
        case AutoUpdateActions.AUTO_UPDATE_START_DOWNLOAD:
            return setDownloading(state, action);
        case AutoUpdateActions.AUTO_UPDATE_DOWNLOADING:
            return setPercentDownloadedAsInteger(
                state,
                action.percentDownloaded
            );
        case AutoUpdateActions.AUTO_UPDATE_CANCEL_DOWNLOAD:
            return state.set('isCancelling', true);
        case AutoUpdateActions.AUTO_UPDATE_DOWNLOAD_CANCELLED:
            return initialState;
        case AutoUpdateActions.AUTO_UPDATE_ERROR:
            return initialState;
        default:
            return state;
    }
};

export default reducer;
