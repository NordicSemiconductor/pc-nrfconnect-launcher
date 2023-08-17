/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import { Logo, RootErrorDialog } from 'pc-nrfconnect-shared';

import About from './features/about/About';
import AppList from './features/apps/AppList';
import UpdateAvailableDialog from './features/launcherUpdate/UpdateAvailableDialog';
import UpdateProgressDialog from './features/launcherUpdate/UpdateProgressDialog';
import DropZoneForLocalApps from './features/localAppInstall/DropZoneForLocalApps';
import ProxyErrorDialog from './features/proxyLogin/ProxyErrorDialog';
import ProxyLoginDialog from './features/proxyLogin/ProxyLoginDialog';
import QuickstartTab from './features/quickstart/quickstartTab';
import Settings from './features/settings/Settings';
import UsageDataDialog from './features/usageData/UsageDataDialog';
import ErrorBoundaryLauncher from './util/ErrorBoundaryLauncher';

const blurActiveElementOnLaunch = () => {
    /* react-bootstrap 1.0.1 on macOS focusses the first nav item after a few
       milliseconds. Seems to be a bug. To conterfeit this, we detect whether
       something is focused within the first 50 milliseconds and if so we
       deselect it again. This can probably be removed if we upgrade to a
       later react-bootstrap or if we stop using react-bootstrap. */
    let timePassed = 0;
    const intervalLength = 5;

    const interval = setInterval(() => {
        const somethingIsFocused = document.activeElement !== document.body;
        if (somethingIsFocused) {
            (document.activeElement as HTMLElement)?.blur();
        }

        if (timePassed >= 50 || somethingIsFocused) {
            clearInterval(interval);
        }

        timePassed += intervalLength;
    }, intervalLength);
};

export default () => {
    useEffect(blurActiveElementOnLaunch, []);

    return (
        <ErrorBoundaryLauncher>
            <DropZoneForLocalApps>
                <Tab.Container id="launcher" defaultActiveKey="apps">
                    <Nav>
                        {/* eslint-disable-next-line jsx-a11y/no-access-key */}
                        <Nav.Link accessKey="1" eventKey="apps">
                            apps
                        </Nav.Link>
                        {/* eslint-disable-next-line jsx-a11y/no-access-key */}
                        <Nav.Link accessKey="2" eventKey="settings">
                            settings
                        </Nav.Link>
                        {/* eslint-disable-next-line jsx-a11y/no-access-key */}
                        <Nav.Link accessKey="3" eventKey="quickstart">
                            quickstart
                        </Nav.Link>
                        {/* eslint-disable-next-line jsx-a11y/no-access-key */}
                        <Nav.Link accessKey="4" eventKey="about">
                            about
                        </Nav.Link>
                        <Logo />
                    </Nav>
                    <Tab.Content>
                        <Tab.Pane eventKey="apps">
                            <AppList />
                        </Tab.Pane>
                        <Tab.Pane eventKey="settings">
                            <Settings />
                        </Tab.Pane>
                        <Tab.Pane eventKey="quickstart">
                            <QuickstartTab />
                        </Tab.Pane>
                        <Tab.Pane eventKey="about">
                            <About />
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </DropZoneForLocalApps>

            <RootErrorDialog />
            <UpdateAvailableDialog />
            <UpdateProgressDialog />
            <UsageDataDialog />
            <ProxyLoginDialog />
            <ProxyErrorDialog />
        </ErrorBoundaryLauncher>
    );
};
