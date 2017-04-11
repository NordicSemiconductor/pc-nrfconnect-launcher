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
 * Input to pc-nrfjprog-js when updating connectivity firmware. Using the webpack
 * raw-loader to load the content of hex files into the bundle as strings.
 *
 * 0: String containing firmware for nRF51
 * 1: String containing firmware for nRF52
 * filecontent: Boolean specifying if the values of 0 and 1 are actual firmware
 *              content or filesystem paths (true if content, false if paths)
 */

import nrf51hex115k2 from 'pc-ble-driver-js/pc-ble-driver/hex/sd_api_v2/connectivity_1.1.0_115k2_with_s130_2.0.1.hex';
import nrf52hex115k2 from 'pc-ble-driver-js/pc-ble-driver/hex/sd_api_v3/connectivity_1.1.0_115k2_with_s132_3.0.hex';
import nrf51hex1m from 'pc-ble-driver-js/pc-ble-driver/hex/sd_api_v2/connectivity_1.1.0_1m_with_s130_2.0.1.hex';
import nrf52hex1m from 'pc-ble-driver-js/pc-ble-driver/hex/sd_api_v3/connectivity_1.1.0_1m_with_s132_3.0.hex';

export default {
    '115k2': {
        0: nrf51hex115k2,
        1: nrf52hex115k2,
        filecontent: true,
    },
    '1m': {
        0: nrf51hex1m,
        1: nrf52hex1m,
        filecontent: true,
    },
};
