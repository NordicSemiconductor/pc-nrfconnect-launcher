/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';

import { useLauncherSelector } from '../../util/hooks';
import Link from '../../util/Link';
import { getNoAppsExist } from './appsSlice';

export default () => {
    const noAppsExist = useLauncherSelector(getNoAppsExist);

    const [justStarted, setJustStarted] = useState(true);

    useEffect(() => {
        setTimeout(() => setJustStarted(false), 2000);
    }, []);

    if (justStarted && noAppsExist) return null;

    return (
        <div className="tw-grid tw-flex-1 tw-place-items-center">
            <div className="tw-max-w-[75%] tw-bg-white tw-p-4">
                {noAppsExist ? (
                    <>
                        The list of apps is not yet loaded from{' '}
                        <Link href="https://developer.nordicsemi.com" />. Make
                        sure you can reach that server.
                    </>
                ) : (
                    'No apps shown because of the selected filters. Change those to display apps again.'
                )}
            </div>
        </div>
    );
};
