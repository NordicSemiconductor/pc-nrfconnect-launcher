/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { getUpdateChannel } from '../../common/persistedStore';

export default () => {
    const updateChannel = getUpdateChannel();

    return updateChannel == null ? null : (
        <div className="tw-fixed tw-right-0 tw-top-0 tw-rounded-bl-md tw-bg-lightGreen-200 tw-p-1">
            {updateChannel}
        </div>
    );
};
