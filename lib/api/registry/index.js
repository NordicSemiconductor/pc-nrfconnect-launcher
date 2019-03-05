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

import { findParentIdPrefixes, findJlinkIds } from './jlink';

// Finding the J-Link ID involves:
// 1. Query the registry for keys below HKLM\SYSTEM\CurrentControlSet\Enum\USB
//    that have a PortName variable that matches the given comName. We parse
//    the key to find a ParentIdPrefix value. The key looks something like
//    this:
//
//    HKLM\SYSTEM\CurrentControlSet\Enum\USB\VID_1366&PID_1015&MI_00\
//      7&2f8ac9e0&0&0000\Device Parameters
//
//    The ParentIdPrefix value is the '7&2f8ac9e0&0' part of this key.
//
// 2. Query the registry for keys below HKLM\SYSTEM\CurrentControlSet\Enum\USB
//    that have the ParentIdPrefix that we found in step 1. This will return
//    keys looking like this:
//
//    HKLM\SYSTEM\CurrentControlSet\Enum\\USB\VID_1366&PID_1015\000682944700
//
//    The J-Link ID is the '000682944700' part of this key.
//
// In rare occasions there may be multiple J-Link IDs returned for the same
// comName. This can happen if the COM port number on the system goes beyond
// COM256, or if the port numbering is manually reset. In these cases the
// registry may contain outdated relations between comNames and J-Link IDs,
// and we do not know which one is correct. We return all IDs found and
// leave it up to the caller to pick the right one.

function findJlinkIdsFromRegistry(comName) {
    return findParentIdPrefixes(comName)
        .then(findJlinkIds)
        .then(jlinkIds => jlinkIds.sort().reverse());
}

const registry = {
    findJlinkIds: findJlinkIdsFromRegistry,
};

export default registry;
