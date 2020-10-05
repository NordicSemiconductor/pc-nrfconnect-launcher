/* Copyright (c) 2015 - 2019, Nordic Semiconductor ASA
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

import React from 'react';

import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';

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
                        {app.upgradeAvailable && (
                            <> (v{app.latestVersion} available)</>
                        )}
                    </div>
                </Col>
                <Col
                    xs="auto ml-auto"
                    className="d-flex align-items-center my-3 pl-3"
                >
                    <ButtonToolbar className="wide-btns">
                        {app.upgradeAvailable && (
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
    app: PropTypes.shape({
        name: PropTypes.string.isRequired,
        displayName: PropTypes.string,
        description: PropTypes.string.isRequired,
        homepage: PropTypes.string,
        currentVersion: PropTypes.string,
        latestVersion: PropTypes.string,
        releaseNote: PropTypes.string,
        source: PropTypes.string,
        upgradeAvailable: PropTypes.bool,
    }).isRequired,
    isUpgrading: PropTypes.bool,
    isRemoving: PropTypes.bool,
    isDisabled: PropTypes.bool,
    isInstalling: PropTypes.bool,
    onReadMore: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onAppSelected: PropTypes.func.isRequired,
    onCreateShortcut: PropTypes.func.isRequired,
    onInstall: PropTypes.func.isRequired,
    onShowReleaseNotes: PropTypes.func.isRequired,
};

AppItem.defaultProps = {
    isDisabled: false,
    isUpgrading: false,
    isRemoving: false,
    isInstalling: false,
};

export default AppItem;
