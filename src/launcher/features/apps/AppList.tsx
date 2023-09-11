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
import AppListEmpty from './AppListEmpty';
import { DisplayedApp, getAllApps } from './appsSlice';
import ConfirmLaunchDialog from './ConfirmLaunchDialog';
import InstallOtherVersionDialog from './InstallOtherVersionDialog';

const sortByStateAndName = (appA: AppType, appB: AppType) => {
    const cmpInstalled = Number(isInstalled(appB)) - Number(isInstalled(appA));

    const aName = appA.displayName || appA.name;
    const bName = appB.displayName || appB.name;

    return cmpInstalled || aName.localeCompare(bName);
};

const Apps = ({ apps }: { apps: DisplayedApp[] }) => (
    <WithScrollbarContainer hasFilter>
        {apps.map(app => (
            <App key={`${app.name}-${app.source}`} app={app} />
        ))}
    </WithScrollbarContainer>
);

export default () => {
    const appsFilter = useLauncherSelector(getAppsFilter);

    const apps = useLauncherSelector(getAllApps)
        .filter(appsFilter)
        .sort(sortByStateAndName);

    return (
        <>
            <AppFilterBar />
            {apps.length === 0 ? <AppListEmpty /> : <Apps apps={apps} />}
            <ConfirmLaunchDialog />
            <InstallOtherVersionDialog />
            <ReleaseNotesDialog />
        </>
    );
};
