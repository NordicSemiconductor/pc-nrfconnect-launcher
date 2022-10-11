/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Col from 'react-bootstrap/Col';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';

import { DisplayedApp } from '../appsSlice';
import AppIcon from './AppIcon';
import AppProgress from './AppProgress';
import CreateShortcut from './CreateShortcut';
import InstallApp from './InstallApp';
import OpenApp from './OpenApp';
import OpenHomepage from './OpenHomepage';
import ShowReleaseNotes from './ShowReleaseNotes';
import UninstallApp from './UninstallApp';
import UpdateApp from './UpdateApp';

const App: React.FC<{ app: DisplayedApp }> = ({ app }) => (
    <ListGroup.Item>
        <Row noGutters className="py-1">
            <Col xs="auto" className="d-flex align-items-start my-2 mr-3">
                <AppIcon app={app} />
            </Col>
            <Col>
                <div className="h8">{app.displayName || app.name}</div>
                <div className="small text-muted">{app.description}</div>
                <div className="small text-muted-more">
                    {app.source}
                    {app.isInstalled && <>, v{app.currentVersion}</>}
                    {app.isInstalled &&
                        app.isDownloadable &&
                        app.upgradeAvailable && (
                            <> (v{app.latestVersion} available)</>
                        )}
                    {!app.isInstalled && app.latestVersion && (
                        <>, v{app.latestVersion}</>
                    )}
                </div>
            </Col>
            <Col
                xs="auto"
                className="d-flex align-items-center my-3 pl-3 ml-auto"
            >
                <ButtonToolbar className="wide-btns">
                    <UpdateApp app={app} />
                    <OpenApp app={app} />
                    <InstallApp app={app} />
                    <DropdownButton
                        variant={
                            app.isInstalled
                                ? 'outline-primary'
                                : 'outline-secondary'
                        }
                        title=""
                        alignRight
                    >
                        <OpenHomepage app={app} />
                        <ShowReleaseNotes app={app} />
                        <CreateShortcut app={app} />
                        <UninstallApp app={app} />
                    </DropdownButton>
                </ButtonToolbar>
            </Col>
        </Row>
        <AppProgress app={app} />
    </ListGroup.Item>
);

export default App;
