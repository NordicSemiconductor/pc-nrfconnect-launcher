/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, {
    MouseEventHandler,
    ReactNode,
    useEffect,
    useState,
} from 'react';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import Link from '../../util/Link';
import { checkForUpdatesManually } from '../launcherUpdate/launcherUpdateEffects';
import { getShouldCheckForUpdatesAtStartup } from '../settings/settingsSlice';
import { getNoAppsExist } from './appsSlice';

const Box = ({ children }: { children: ReactNode }) => (
    <div className="tw-grid tw-flex-1 tw-place-items-center">
        <div className="tw-max-w-[75%] tw-bg-white tw-p-4">{children}</div>
    </div>
);

const InlineButton = ({
    onClick,
    children,
}: {
    children: ReactNode;
    onClick: MouseEventHandler;
}) => (
    <button
        className="tw-inline tw-border-0 tw-bg-white tw-p-0 tw-text-primary"
        type="button"
        onClick={onClick}
    >
        {children}
    </button>
);

const CheckForUpdatesDisabled = () => {
    const dispatch = useLauncherDispatch();

    return (
        <Box>
            No apps are loaded from the server yet and you have “Check for
            updates at startup” disabled in the settings. You can enable it
            there or just{' '}
            <InlineButton onClick={() => dispatch(checkForUpdatesManually())}>
                now check once for updates
            </InlineButton>
            .
        </Box>
    );
};

const NotLoadedYet = () => {
    const [justStarted, setJustStarted] = useState(true);

    useEffect(() => {
        setTimeout(() => setJustStarted(false), 2000);
    }, []);

    return justStarted ? null : (
        <Box>
            The list of apps is not yet loaded from{' '}
            <Link href="https://developer.nordicsemi.com" />. Make sure you can
            reach that server.
        </Box>
    );
};

const NoApps = () => {
    const shouldCheckForUpdatesAtStartup = useLauncherSelector(
        getShouldCheckForUpdatesAtStartup
    );

    return shouldCheckForUpdatesAtStartup ? (
        <NotLoadedYet />
    ) : (
        <CheckForUpdatesDisabled />
    );
};

const AllFilteredOut = () => (
    <Box>
        No apps shown because of the selected filters. Change those to display
        apps again.
    </Box>
);

export default () => {
    const noAppsExist = useLauncherSelector(getNoAppsExist);

    return noAppsExist ? <NoApps /> : <AllFilteredOut />;
};
