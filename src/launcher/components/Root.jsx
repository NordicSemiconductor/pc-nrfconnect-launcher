/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import { ErrorDialog, Logo } from 'pc-nrfconnect-shared';

import AppManagementContainer from '../containers/AppManagementContainer';
import ConfirmLaunchContainer from '../containers/ConfirmLaunchContainer';
import ProxyErrorContainer from '../containers/ProxyErrorContainer';
import ProxyLoginContainer from '../containers/ProxyLoginContainer';
import SettingsContainer from '../containers/SettingsContainer';
import UpdateAvailableContainer from '../containers/UpdateAvailableContainer';
import UpdateProgressContainer from '../containers/UpdateProgressContainer';
import UsageDataDialogContainer from '../containers/UsageDataDialogContainer';
import AboutView from './AboutView';
import ErrorBoundaryLauncher from './ErrorBoundaryLauncher';

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
            document.activeElement.blur();
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
                    <Nav.Link accessKey="3" eventKey="about">
                        about
                    </Nav.Link>
                    <Logo />
                </Nav>
                <Tab.Content>
                    <Tab.Pane eventKey="apps">
                        <AppManagementContainer />
                    </Tab.Pane>
                    <Tab.Pane eventKey="settings" className="me_32px">
                        <SettingsContainer />
                    </Tab.Pane>
                    <Tab.Pane eventKey="about">
                        <AboutView />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
            <ErrorDialog />
            <UpdateAvailableContainer />
            <UpdateProgressContainer />
            <UsageDataDialogContainer />
            <ConfirmLaunchContainer />
            <ProxyLoginContainer />
            <ProxyErrorContainer />
        </ErrorBoundaryLauncher>
    );
};
