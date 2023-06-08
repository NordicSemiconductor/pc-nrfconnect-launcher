/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Col from 'react-bootstrap/Col';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';

import { isInstalled, isUpdatable, isWithdrawn } from '../../../../ipc/apps';
import { DisplayedApp } from '../appsSlice';
import AppIcon from './AppIcon';
import AppProgress from './AppProgress';
import CreateShortcut from './CreateShortcut';
import InstallApp from './InstallApp';
import InstallOtherVersion from './InstallOtherVersion';
import OpenApp from './OpenApp';
import OpenHomepage from './OpenHomepage';
import ShowReleaseNotes from './ShowReleaseNotes';
import UninstallApp from './UninstallApp';
import UpdateApp from './UpdateApp';

const App: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    const itemRef = React.useRef<HTMLAnchorElement>(null);
    const installedStatusRef = React.useRef<boolean>(isInstalled(app));

    useEffect(() => {
        if (
            installedStatusRef.current === false &&
            isInstalled(app) &&
            itemRef.current
        ) {
            itemRef.current.classList.add('app-entry-highlight');
            setTimeout(
                () => itemRef.current?.classList.remove('app-entry-highlight'),
                3000
            );
            installedStatusRef.current = isInstalled(app);
        }
    }, [app]);

    return (
        <ListGroup.Item ref={itemRef}>
            <Row noGutters className="py-1">
                <Col xs="auto" className="d-flex align-items-start my-2 mr-3">
                    <AppIcon app={app} />
                </Col>
                <Col>
                    <div className="h8">{app.displayName || app.name}</div>
                    <div className="small text-muted">{app.description}</div>
                    <div className="small text-muted-more">
                        {app.source}
                        {isInstalled(app) && <>, v{app.currentVersion}</>}
                        {isUpdatable(app) && (
                            <> (v{app.latestVersion} available)</>
                        )}
                        {!isInstalled(app) &&
                            !isWithdrawn(app) &&
                            app.latestVersion && <>, v{app.latestVersion}</>}
                        {isWithdrawn(app) && (
                            <>, not available for download anymore</>
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
                                isInstalled(app)
                                    ? 'outline-primary'
                                    : 'outline-secondary'
                            }
                            title=""
                            alignRight
                        >
                            <OpenHomepage app={app} />
                            <ShowReleaseNotes app={app} />
                            <CreateShortcut app={app} />
                            <InstallOtherVersion app={app} />
                            <UninstallApp app={app} />
                        </DropdownButton>
                    </ButtonToolbar>
                </Col>
            </Row>
            <AppProgress app={app} />
        </ListGroup.Item>
    );
};

export default App;
