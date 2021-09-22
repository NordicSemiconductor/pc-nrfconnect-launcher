/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { findJlinkIds, findParentIdPrefixes } from './jlink';

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
