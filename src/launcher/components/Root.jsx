/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
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

export default () => (
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
                <Tab.Pane eventKey="settings">
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
