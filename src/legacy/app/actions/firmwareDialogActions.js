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

/**
 * Indicates that the FirmwareDialog should be shown, which asks the user if
 * the firmware for the given port should be updated. Apps will typically
 * dispatch this action to show the FirmwareDialog to the user.
 *
 * @param {Object} port Serial port object, ref. the serialport library.
 */
export const FIRMWARE_DIALOG_SHOW = 'FIRMWARE_DIALOG_SHOW';

/**
 * Indicates that the FirmwareDialog should be hidden. Apps will typically
 * dispatch this action to hide the FirmwareDialog after a firmware update
 * has completed or failed.
 */
export const FIRMWARE_DIALOG_HIDE = 'FIRMWARE_DIALOG_HIDE';

/**
 * Indicates that updating the firmware for the given port has been requested.
 *
 * Apps can listen to this action in middleware, and implement their own
 * firmware update routine. This will typically involve calling pc-nrfjprog-js
 * with the firmware that the app requires.
 *
 * @param {Object} port Serial port object, ref. the serialport library.
 */
export const FIRMWARE_DIALOG_UPDATE_REQUESTED =
    'FIRMWARE_DIALOG_UPDATE_REQUESTED';

export function showDialog(port) {
    return {
        type: FIRMWARE_DIALOG_SHOW,
        port,
    };
}

export function hideDialog() {
    return {
        type: FIRMWARE_DIALOG_HIDE,
    };
}

export function firmwareUpdateRequested(port) {
    return {
        type: FIRMWARE_DIALOG_UPDATE_REQUESTED,
        port,
    };
}
