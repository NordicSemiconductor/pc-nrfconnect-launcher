/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import formatDate from 'date-fns/format';
import { clipboard } from 'electron';
import { colors, Toggle } from 'pc-nrfconnect-shared';
import { bool, func, instanceOf, shape } from 'prop-types';

import ConfirmRemoveSourceDialog from '../containers/ConfirmRemoveSourceDialog';
import InputLineDialog from './InputLineDialog';

const { white, gray700, nordicBlue } = colors;

function cancel(event) {
    event.preventDefault();
    const { dataTransfer } = event;
    dataTransfer.dropEffect = 'copy';
    return false;
}

class SettingsView extends React.Component {
    constructor() {
        super();
        this.onCheckUpdatesAtStartupChanged =
            this.onCheckUpdatesAtStartupChanged.bind(this);
        this.onTriggerUpdateCheckClicked =
            this.onTriggerUpdateCheckClicked.bind(this);
    }

    componentDidMount() {
        const { onMount } = this.props;
        onMount();
    }

    onCheckUpdatesAtStartupChanged() {
        const {
            onCheckUpdatesAtStartupChanged,
            shouldCheckForUpdatesAtStartup,
        } = this.props;
        onCheckUpdatesAtStartupChanged(!shouldCheckForUpdatesAtStartup);
    }

    onTriggerUpdateCheckClicked() {
        const { onTriggerUpdateCheck } = this.props;
        onTriggerUpdateCheck();
    }

    onDropUrl(event) {
        const { addSource } = this.props;
        event.preventDefault();
        const url = event.dataTransfer.getData('Text');
        addSource(url);
    }

    render() {
        const {
            shouldCheckForUpdatesAtStartup,
            isCheckingForUpdates,
            lastUpdateCheckDate,
            isUpdateCheckCompleteDialogVisible,
            onHideUpdateCheckCompleteDialog,
            isAppUpdateAvailable,
            sources,
            addSource,
            isAddSourceDialogVisible,
            onShowAddSourceDialog,
            onHideAddSourceDialog,
            onShowRemoveSourceDialog,
            isSendingUsageData,
            toggleSendingUsageData,
            showUsageDataDialog,
        } = this.props;

        const sourcesJS = sources.toJS();

        return (
            <div className="settings-pane-container">
                <Card body>
                    <Row>
                        <Col>
                            <Card.Title>Updates</Card.Title>
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="outline-primary"
                                onClick={this.onTriggerUpdateCheckClicked}
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
                        onToggle={() => this.onCheckUpdatesAtStartupChanged()}
                        isToggled={shouldCheckForUpdatesAtStartup}
                        variant="primary"
                        handleColor={white}
                        barColor={gray700}
                        barColorToggled={nordicBlue}
                    />
                </Card>
                <Card
                    body
                    onDrop={event => this.onDropUrl(event)}
                    onDragOver={cancel}
                    onDragEnter={cancel}
                    id="app-sources"
                >
                    <Row>
                        <Col>
                            <Card.Title>App sources</Card.Title>
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="outline-primary"
                                onClick={onShowAddSourceDialog}
                            >
                                Add source
                            </Button>
                        </Col>
                    </Row>
                    {Object.keys(sourcesJS)
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
                                                    sourcesJS[name]
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
                                                onShowRemoveSourceDialog(name)
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
                                onToggle={() => toggleSendingUsageData()}
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
                                onClick={showUsageDataDialog}
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
                <InputLineDialog
                    isVisible={isAddSourceDialogVisible}
                    title="Add source"
                    placeholder="https://..."
                    subtext="The source file must be in .json format"
                    onOk={url => {
                        addSource(url);
                        onHideAddSourceDialog();
                    }}
                    onCancel={onHideAddSourceDialog}
                />
                <ConfirmRemoveSourceDialog />
            </div>
        );
    }
}

SettingsView.propTypes = {
    onMount: func,
    shouldCheckForUpdatesAtStartup: bool.isRequired,
    isCheckingForUpdates: bool.isRequired,
    onCheckUpdatesAtStartupChanged: func.isRequired,
    onTriggerUpdateCheck: func.isRequired,
    lastUpdateCheckDate: instanceOf(Date),
    isUpdateCheckCompleteDialogVisible: bool,
    onHideUpdateCheckCompleteDialog: func.isRequired,
    isAppUpdateAvailable: bool,
    sources: shape({
        toJS: func.isRequired,
    }).isRequired,
    addSource: func.isRequired,
    onShowRemoveSourceDialog: func.isRequired,
    isAddSourceDialogVisible: bool,
    onShowAddSourceDialog: func.isRequired,
    onHideAddSourceDialog: func.isRequired,
    isSendingUsageData: bool.isRequired,
    toggleSendingUsageData: func.isRequired,
    showUsageDataDialog: func.isRequired,
};

SettingsView.defaultProps = {
    onMount: () => {},
    lastUpdateCheckDate: null,
    isUpdateCheckCompleteDialogVisible: false,
    isAppUpdateAvailable: false,
    isAddSourceDialogVisible: false,
};

export default SettingsView;
