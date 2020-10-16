/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { ErrorDialog, Logo } from 'pc-nrfconnect-shared';
import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';

import AppManagementContainer from '../containers/AppManagementContainer';
import ConfirmLaunchContainer from '../containers/ConfirmLaunchContainer';
import ProxyErrorContainer from '../containers/ProxyErrorContainer';
import ProxyLoginContainer from '../containers/ProxyLoginContainer';
import SettingsContainer from '../containers/SettingsContainer';
import UpdateAvailableContainer from '../containers/UpdateAvailableContainer';
import UpdateProgressContainer from '../containers/UpdateProgressContainer';
import UsageDataDialogContainer from '../containers/UsageDataDialogContainer';

export default () => (
    <>
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
                <Logo />
            </Nav>
            <Tab.Content>
                <Tab.Pane eventKey="apps">
                    <AppManagementContainer />
                </Tab.Pane>
                <Tab.Pane eventKey="settings">
                    <SettingsContainer />
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
    </>
);
