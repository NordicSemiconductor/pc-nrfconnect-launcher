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

import reducer from '../firmwareDialogReducer';
import * as FirmwareDialogActions from '../../actions/firmwareDialogActions';

const initialState = reducer(undefined, {});

describe('firmwareDialogReducer', () => {
    it('should be hidden, with no port, and not in progress by default', () => {
        expect(initialState.isVisible).toEqual(false);
    });

    it('should be visible and have a port object after show action has been dispatched', () => {
        const port = {
            comName: '/dev/tty1',
            path: '/dev/tty1',
            manufacturer: null,
            productId: null,
            serialNumber: null,
            vendorId: null,
        };
        const state = reducer(initialState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_SHOW,
            port,
        });
        expect(state.isVisible).toEqual(true);
        expect(state.port.toJS()).toEqual(port);
    });

    it('should have isInProgress true after firmware update action has been dispatched', () => {
        const state = reducer(initialState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_UPDATE_REQUESTED,
        });
        expect(state.isInProgress).toEqual(true);
    });

    it('should be hidden, with no port, and not in progress after hide action has been dispatched', () => {
        const port = { path: '/dev/tty1' };
        const firstState = reducer(initialState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_SHOW,
            port,
        });
        const secondState = reducer(firstState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_UPDATE_REQUESTED,
        });
        const thirdState = reducer(secondState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_HIDE,
        });
        expect(thirdState.isVisible).toEqual(false);
        expect(thirdState.isInProgress).toEqual(false);
        expect(thirdState.port).toEqual(null);
    });
});
