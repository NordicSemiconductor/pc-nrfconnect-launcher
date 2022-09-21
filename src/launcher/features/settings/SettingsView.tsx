/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import formatDate from 'date-fns/format';
import { clipboard } from 'electron';
import { colors, Toggle } from 'pc-nrfconnect-shared';

import { toggleSendingUsageData } from '../../actions/usageDataActions';
import WithScrollbarContainer from '../../containers/WithScrollbarContainer';
import { getApps } from '../../reducers/appsReducer';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { checkForUpdatesManually } from '../launcherUpdate/launcherUpdateEffects';
import AddSourceDialog from '../sources/AddSourceDialog';
import ConfirmRemoveSourceDialog from '../sources/ConfirmRemoveSourceDialog';
import { addSource, loadSources } from '../sources/sourcesEffects';
import {
    getSources,
    showAddSource,
    showRemoveSource,
} from '../sources/sourcesSlice';
import { checkUpdatesAtStartupChanged, loadSettings } from './settingsEffects';
import {
    getSettings,
    hideUpdateCheckCompleteDialog,
    showUsageDataDialog,
} from './settingsSlice';

const { white, gray700, nordicBlue } = colors;

const cancel: React.DragEventHandler = event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
};

export default () => {
    const dispatch = useLauncherDispatch();

    useEffect(() => {
        loadSettings(dispatch);
        loadSources(dispatch);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const {
        shouldCheckForUpdatesAtStartup,
        isUpdateCheckCompleteDialogVisible,
        isSendingUsageData,
    } = useLauncherSelector(getSettings);

    const sources = useLauncherSelector(getSources);

    const {
        isDownloadingLatestAppInfo: isCheckingForUpdates,
        lastUpdateCheckDate,
        downloadableApps,
    } = useLauncherSelector(getApps);

    const isAppUpdateAvailable = !!downloadableApps.find(
        app => app.currentVersion && app.currentVersion !== app.latestVersion
    );

    const onHideUpdateCheckCompleteDialog = () =>
        dispatch(hideUpdateCheckCompleteDialog());

    const onDropUrl: React.DragEventHandler = event => {
        event.preventDefault();
        const url = event.dataTransfer.getData('Text');
        dispatch(addSource(url));
    };

    return (
        <WithScrollbarContainer>
            <div className="settings-pane-container">
                <Card body>
                    <Row>
                        <Col>
                            <Card.Title>Updates</Card.Title>
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="outline-primary"
                                onClick={() =>
                                    dispatch(checkForUpdatesManually())
                                }
                                disabled={isCheckingForUpdates}
                            >
                                {isCheckingForUpdates
                                    ? 'Checking...'
                                    : 'Check for updates'}
                            </Button>
                        </Col>
                    </Row>
                    <p className="small text-muted">
                        {lastUpdateCheckDate && (
                            <>
                                Last update check performed:{' '}
                                {formatDate(
                                    lastUpdateCheckDate,
                                    'yyyy-MM-dd HH:mm:ss'
                                )}
                            </>
                        )}
                    </p>
                    <Toggle
                        id="checkForUpdates"
                        label="Check for updates at startup"
                        onToggle={() =>
                            dispatch(
                                checkUpdatesAtStartupChanged(
                                    !shouldCheckForUpdatesAtStartup
                                )
                            )
                        }
                        isToggled={shouldCheckForUpdatesAtStartup}
                        variant="primary"
                        handleColor={white}
                        barColor={gray700}
                        barColorToggled={nordicBlue}
                    />
                </Card>
                <Card
                    body
                    onDrop={onDropUrl}
                    onDragOver={cancel}
                    id="app-sources"
                >
                    <Row>
                        <Col>
                            <Card.Title>App sources</Card.Title>
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="outline-primary"
                                onClick={() => dispatch(showAddSource())}
                            >
                                Add source
                            </Button>
                        </Col>
                    </Row>
                    {Object.keys(sources)
                        .filter(name => name !== 'official')
                        .map(name => (
                            <Row key={name}>
                                <Col className="item-name text-capitalize">
                                    {name}
                                </Col>
                                <Col xs="auto">
                                    <ButtonToolbar>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() =>
                                                clipboard.writeText(
                                                    sources[name]
                                                )
                                            }
                                            title="Copy URL to clipboard"
                                        >
                                            Copy URL
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() =>
                                                dispatch(showRemoveSource(name))
                                            }
                                            title="Remove source and associated apps"
                                        >
                                            Remove
                                        </Button>
                                    </ButtonToolbar>
                                </Col>
                            </Row>
                        ))}
                </Card>
                <Card body>
                    <Row>
                        <Col>
                            <Card.Title>Usage statistics</Card.Title>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Toggle
                                id="checkForShare"
                                label="Collect anonymous usage data"
                                onToggle={() =>
                                    dispatch(toggleSendingUsageData())
                                }
                                isToggled={isSendingUsageData}
                                variant="primary"
                                handleColor={white}
                                barColor={gray700}
                                barColorToggled={nordicBlue}
                            />
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="outline-primary"
                                onClick={() => dispatch(showUsageDataDialog())}
                            >
                                Show agreement
                            </Button>
                        </Col>
                    </Row>
                </Card>
                <Modal
                    show={isUpdateCheckCompleteDialogVisible}
                    onHide={onHideUpdateCheckCompleteDialog}
                >
                    <Modal.Header>
                        <Modal.Title>Update check completed</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {isAppUpdateAvailable ? (
                            <>
                                One or more updates are available. Go to the
                                apps screen to update.
                            </>
                        ) : (
                            <>All apps are up to date.</>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="outline-primary"
                            onClick={onHideUpdateCheckCompleteDialog}
                        >
                            Got it
                        </Button>
                    </Modal.Footer>
                </Modal>
                <AddSourceDialog />
                <ConfirmRemoveSourceDialog />
            </div>
        </WithScrollbarContainer>
    );
};