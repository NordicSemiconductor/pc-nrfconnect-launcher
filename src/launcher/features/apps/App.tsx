/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import { openUrl } from 'pc-nrfconnect-shared';

import { DownloadableApp, LocalApp } from '../../../ipc/apps';
import { createDesktopShortcut } from '../../../ipc/createDesktopShortcut';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { show as showReleaseNotes } from '../releaseNotes/releaseNotesDialogSlice';
import AppIcon from './AppIcon';
import {
    checkEngineAndLaunch,
    installDownloadableApp,
    removeDownloadableApp,
} from './appsEffects';
import {
    getIsAppInstalling,
    getIsAppRemoving,
    getIsAppUpgrading,
} from './appsSlice';

import '../../../../resources/css/launcher.scss';

const AppItem: React.FC<{
    app: LocalApp | (DownloadableApp & { progress?: number });
    isDisabled: boolean;
}> = ({ app, isDisabled }) => {
    const dispatch = useLauncherDispatch();

    const isInstalling = useLauncherSelector(getIsAppInstalling(app));
    const isUpgrading = useLauncherSelector(getIsAppUpgrading(app));
    const isRemoving = useLauncherSelector(getIsAppRemoving(app));

    return (
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
                        {app.isInstalled &&
                            app.isDownloadable &&
                            app.upgradeAvailable && (
                                <Button
                                    variant="outline-primary"
                                    title={`Update ${app.displayName}`}
                                    disabled={isDisabled}
                                    onClick={() =>
                                        dispatch(showReleaseNotes(app))
                                    }
                                >
                                    {isUpgrading ? 'Updating...' : 'Update'}
                                </Button>
                            )}
                        {app.isInstalled && (
                            <Button
                                title={`Open ${app.displayName}`}
                                disabled={isDisabled}
                                onClick={() =>
                                    dispatch(checkEngineAndLaunch(app))
                                }
                            >
                                Open
                            </Button>
                        )}
                        {!app.isInstalled && (
                            <Button
                                variant="outline-secondary"
                                title={`Install ${app.displayName}`}
                                disabled={isDisabled}
                                onClick={() =>
                                    dispatch(installDownloadableApp(app))
                                }
                            >
                                {isInstalling ? 'Installing...' : 'Install'}
                            </Button>
                        )}
                        <DropdownButton
                            variant={
                                app.isInstalled
                                    ? 'outline-primary'
                                    : 'outline-secondary'
                            }
                            title=""
                            alignRight
                        >
                            {app.isDownloadable && app.homepage != null && (
                                <Dropdown.Item
                                    title="Go to app website"
                                    onClick={() => openUrl(app.homepage!)} // eslint-disable-line @typescript-eslint/no-non-null-assertion
                                >
                                    More info
                                </Dropdown.Item>
                            )}
                            {app.isDownloadable && app.releaseNote && (
                                <Dropdown.Item
                                    title="Show release notes"
                                    onClick={() =>
                                        dispatch(showReleaseNotes(app))
                                    }
                                >
                                    Release notes
                                </Dropdown.Item>
                            )}
                            {app.isInstalled && (
                                <Dropdown.Item
                                    title="Create a desktop shortcut for this app"
                                    onClick={() => createDesktopShortcut(app)}
                                >
                                    Create shortcut
                                </Dropdown.Item>
                            )}
                            {app.isInstalled && app.isDownloadable && (
                                <Dropdown.Item
                                    title={`Remove ${app.displayName}`}
                                    disabled={isDisabled}
                                    onClick={() =>
                                        dispatch(removeDownloadableApp(app))
                                    }
                                >
                                    {isRemoving
                                        ? 'Uninstalling...'
                                        : 'Uninstall'}
                                </Dropdown.Item>
                            )}
                        </DropdownButton>
                    </ButtonToolbar>
                </Col>
            </Row>
            {app.isDownloadable && app.progress != null && (
                <ProgressBar now={app.progress} />
            )}
        </ListGroup.Item>
    );
};

export default AppItem;
