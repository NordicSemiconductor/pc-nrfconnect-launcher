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
// COM256 and the system starts using comNames that have been used with a
// different J-Link ID before. In these cases, old J-Link IDs exist in the
// registry, and we do not know which one is correct. We return all IDs found
// so that the application can display a warning. The largest ID is returned
// first.

function findJlinkIdsFromRegistry(comName) {
    return findParentIdPrefixes(comName)
        .then(findJlinkIds)
        .then(jlinkIds => jlinkIds.sort().reverse());
}

export default {
    findJlinkIds: findJlinkIdsFromRegistry,
};
