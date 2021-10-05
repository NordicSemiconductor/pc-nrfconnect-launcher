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
import Row from 'react-bootstrap/Row';
import { bool, func, shape, string } from 'prop-types';

import AppIcon from './AppIcon';

const AppItem = ({
    app,
    onRemove,
    isUpgrading,
    isRemoving,
    isDisabled,
    isInstalling,
    onAppSelected,
    onCreateShortcut,
    onInstall,
    onReadMore,
    onShowReleaseNotes,
}) => {
    const installed = !!app.currentVersion;
    const local = !app.source;
    return (
        <ListGroup.Item>
            <Row noGutters className="py-1">
                <Col xs="auto my-2 mr-3" className="d-flex align-items-start">
                    <AppIcon app={app} />
                </Col>
                <Col>
                    <div className="h8">{app.displayName || app.name}</div>
                    <div className="small text-muted">{app.description}</div>
                    <div className="small text-muted-more">
                        {app.source || 'local'}
                        {installed && <>, v{app.currentVersion}</>}
                        {installed && app.upgradeAvailable && (
                            <> (v{app.latestVersion} available)</>
                        )}
                        {!installed && app.latestVersion && (
                            <>, v{app.latestVersion}</>
                        )}
                    </div>
                </Col>
                <Col
                    xs="auto ml-auto"
                    className="d-flex align-items-center my-3 pl-3"
                >
                    <ButtonToolbar className="wide-btns">
                        {installed && app.upgradeAvailable && (
                            <Button
                                variant="outline-primary"
                                title={`Update ${app.displayName}`}
                                disabled={isDisabled}
                                onClick={onShowReleaseNotes}
                            >
                                {isUpgrading ? 'Updating...' : 'Update'}
                            </Button>
                        )}
                        {installed && (
                            <Button
                                title={`Open ${app.displayName}`}
                                disabled={isDisabled}
                                onClick={onAppSelected}
                            >
                                Open
                            </Button>
                        )}
                        {!installed && (
                            <Button
                                variant="outline-secondary"
                                title={`Install ${app.displayName}`}
                                disabled={isDisabled}
                                onClick={onInstall}
                            >
                                {isInstalling ? 'Installing...' : 'Install'}
                            </Button>
                        )}
                        <DropdownButton
                            variant={
                                installed
                                    ? 'outline-primary'
                                    : 'outline-secondary'
                            }
                            title=""
                            alignRight
                        >
                            {app.homepage && (
                                <Dropdown.Item
                                    title="Go to app website"
                                    onClick={onReadMore}
                                >
                                    More info
                                </Dropdown.Item>
                            )}
                            {app.releaseNote && (
                                <Dropdown.Item
                                    title="Show release notes"
                                    onClick={() => onShowReleaseNotes(app)}
                                >
                                    Release notes
                                </Dropdown.Item>
                            )}
                            {installed && (
                                <Dropdown.Item
                                    title="Create a desktop shortcut for this app"
                                    onClick={onCreateShortcut}
                                >
                                    Create shortcut
                                </Dropdown.Item>
                            )}
                            {installed && !local && (
                                <Dropdown.Item
                                    title={`Remove ${app.displayName}`}
                                    disabled={isDisabled}
                                    onClick={onRemove}
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
        </ListGroup.Item>
    );
};

AppItem.propTypes = {
    app: shape({
        name: string.isRequired,
        displayName: string,
        description: string.isRequired,
        homepage: string,
        currentVersion: string,
        latestVersion: string,
        releaseNote: string,
        source: string,
        upgradeAvailable: bool,
    }).isRequired,
    isUpgrading: bool,
    isRemoving: bool,
    isDisabled: bool,
    isInstalling: bool,
    onReadMore: func.isRequired,
    onRemove: func.isRequired,
    onAppSelected: func.isRequired,
    onCreateShortcut: func.isRequired,
    onInstall: func.isRequired,
    onShowReleaseNotes: func.isRequired,
};

AppItem.defaultProps = {
    isDisabled: false,
    isUpgrading: false,
    isRemoving: false,
    isInstalling: false,
};

export default AppItem;
