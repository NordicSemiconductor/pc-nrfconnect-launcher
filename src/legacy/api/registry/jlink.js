/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    parseJlinkId,
    parseMatchingKeys,
    parseParentIdPrefix,
} from './parsing';
import { query } from './reg';

const REGISTRY_USB_PATH =
    'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB';

function unique(array) {
    return [...new Set(array)];
}

function concat(arrays) {
    return [].concat(...arrays);
}

function findParentIdPrefixes(comName) {
    return query(REGISTRY_USB_PATH, comName)
        .then(output => parseMatchingKeys(output, 'PortName', comName))
        .then(keys => keys.map(key => parseParentIdPrefix(key)));
}

function findJlinkIds(parentIdPrefixes) {
    const promises = parentIdPrefixes.map(parentIdPrefix =>
        query(REGISTRY_USB_PATH, parentIdPrefix)
            .then(output =>
                parseMatchingKeys(output, 'ParentIdPrefix', parentIdPrefix)
            )
            .then(keys => keys.map(key => parseJlinkId(key)))
    );
    return Promise.all(promises)
        .then(jlinkIdArrays => concat(jlinkIdArrays))
        .then(jlinkIds => unique(jlinkIds));
}

export { findParentIdPrefixes, findJlinkIds };
