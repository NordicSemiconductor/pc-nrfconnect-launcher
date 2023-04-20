/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { App as AppType, isInstalled } from '../../../ipc/apps';
import { useLauncherSelector } from '../../util/hooks';
import WithScrollbarContainer from '../../util/WithScrollbarContainer';
import AppFilterBar from '../filter/AppFilterBar';
import { getAppsFilter } from '../filter/filterSlice';
import ReleaseNotesDialog from '../releaseNotes/ReleaseNotesDialog';
import App from './App/App';
import { getAllApps } from './appsSlice';
import ConfirmLaunchDialog from './ConfirmLaunchDialog';
import InstallOtherVersionDialog from './InstallOtherVersionDialog';

const sortByStateAndName = (appA: AppType, appB: AppType) => {
    const cmpInstalled = Number(isInstalled(appB)) - Number(isInstalled(appA));

    const aName = appA.displayName || appA.name;
    const bName = appB.displayName || appB.name;

    return cmpInstalled || aName.localeCompare(bName);
};

export default () => {
    const allApps = useLauncherSelector(getAllApps);
    const appsFilter = useLauncherSelector(getAppsFilter);

    const apps = allApps.filter(appsFilter).sort(sortByStateAndName);

    return (
        <>
            <AppFilterBar />
            <WithScrollbarContainer hasFilter>
                {apps.map(app => (
                    <App key={`${app.name}-${app.source}`} app={app} />
                ))}
            </WithScrollbarContainer>

            <ConfirmLaunchDialog />
            <InstallOtherVersionDialog />
            <ReleaseNotesDialog />
        </>
    );
};
