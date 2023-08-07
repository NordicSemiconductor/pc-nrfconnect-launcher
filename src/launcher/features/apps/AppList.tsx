/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { App as AppType, isInstalled } from '../../../ipc/apps';
import { useLauncherSelector } from '../../util/hooks';
import Link from '../../util/Link';
import WithScrollbarContainer from '../../util/WithScrollbarContainer';
import AppFilterBar from '../filter/AppFilterBar';
import { getAppsFilter } from '../filter/filterSlice';
import ReleaseNotesDialog from '../releaseNotes/ReleaseNotesDialog';
import App from './App/App';
import { DisplayedApp, getAllApps } from './appsSlice';
import ConfirmLaunchDialog from './ConfirmLaunchDialog';
import InstallOtherVersionDialog from './InstallOtherVersionDialog';

const sortByStateAndName = (appA: AppType, appB: AppType) => {
    const cmpInstalled = Number(isInstalled(appB)) - Number(isInstalled(appA));

    const aName = appA.displayName || appA.name;
    const bName = appB.displayName || appB.name;

    return cmpInstalled || aName.localeCompare(bName);
};

const NoApps = ({ notYetLoaded }: { notYetLoaded: boolean }) => (
    <div className="tw-grid tw-flex-1 tw-place-items-center">
        <div className="tw-max-w-[75%] tw-bg-white tw-p-4">
            {notYetLoaded ? (
                <>
                    The list of apps is not yet loaded from{' '}
                    <Link href="https://developer.nordicsemi.com" />. Make sure
                    you can reach that server.
                </>
            ) : (
                'No apps shown because of the selected filters. Change those to display apps again.'
            )}
        </div>
    </div>
);

const Apps = ({ apps }: { apps: DisplayedApp[] }) => (
    <WithScrollbarContainer hasFilter>
        {apps.map(app => (
            <App key={`${app.name}-${app.source}`} app={app} />
        ))}
    </WithScrollbarContainer>
);

export default () => {
    const allApps = useLauncherSelector(getAllApps);
    const appsFilter = useLauncherSelector(getAppsFilter);

    const apps = allApps.filter(appsFilter).sort(sortByStateAndName);

    return (
        <>
            <AppFilterBar />
            {apps.length === 0 ? (
                <NoApps notYetLoaded={allApps.length === 0} />
            ) : (
                <Apps apps={apps} />
            )}
            <ConfirmLaunchDialog />
            <InstallOtherVersionDialog />
            <ReleaseNotesDialog />
        </>
    );
};
