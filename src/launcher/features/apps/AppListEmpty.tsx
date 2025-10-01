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
import { ExternalLink } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { startUpdateProcess } from '../process/updateProcess';
import { getShouldCheckForUpdatesAtStartup } from '../settings/settingsSlice';
import { getNoAppsExist } from './appsSlice';

const Box = ({ children }: { children: ReactNode }) => (
    <div className="tw-preflight tw-grid tw-flex-1 tw-place-items-center">
        <div className="tw-text-center">{children}</div>
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
        className="tw-inline tw-border-0 tw-p-0 tw-text-primary"
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
            <p>No apps are loaded from the server yet.</p>
            <p>
                You have “Check for updates at startup” disabled in the
                settings.
            </p>
            <p>
                You can enable it there or now just{' '}
                <InlineButton
                    onClick={() => dispatch(startUpdateProcess(true))}
                >
                    check once for updates
                </InlineButton>
                .
            </p>
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
            <p>
                The list of apps is not yet loaded from{' '}
                <ExternalLink href="https://files.nordicsemi.com" />.
            </p>
            <p>Make sure you can reach that server.</p>
        </Box>
    );
};

const NoApps = () => {
    const shouldCheckForUpdatesAtStartup = useLauncherSelector(
        getShouldCheckForUpdatesAtStartup,
    );

    return shouldCheckForUpdatesAtStartup ? (
        <NotLoadedYet />
    ) : (
        <CheckForUpdatesDisabled />
    );
};

const AllFilteredOut = () => (
    <Box>
        <p>No apps shown because of the selected filters.</p>
        <p>Change those to display apps again.</p>
    </Box>
);

export default () => {
    const noAppsExist = useLauncherSelector(getNoAppsExist);

    return noAppsExist ? <NoApps /> : <AllFilteredOut />;
};
