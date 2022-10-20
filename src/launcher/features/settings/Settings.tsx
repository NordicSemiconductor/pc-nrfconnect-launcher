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
import Row from 'react-bootstrap/Row';
import formatDate from 'date-fns/format';
import { clipboard } from 'electron';
import { colors, Toggle } from 'pc-nrfconnect-shared';

import { OFFICIAL } from '../../../ipc/sources';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import WithScrollbarContainer from '../../util/WithScrollbarContainer';
import { getUpdateCheckStatus } from '../apps/appsSlice';
import { checkForUpdatesManually } from '../launcherUpdate/launcherUpdateEffects';
import AddSourceDialog from '../sources/AddSourceDialog';
import ConfirmRemoveSourceDialog from '../sources/ConfirmRemoveSourceDialog';
import {
    getSources,
    showAddSource,
    showRemoveSource,
} from '../sources/sourcesSlice';
import { toggleSendingUsageData } from '../usageData/usageDataEffects';
import {
    getIsSendingUsageData,
    showUsageDataDialog,
} from '../usageData/usageDataSlice';
import { checkUpdatesAtStartupChanged } from './settingsEffects';
import { getShouldCheckForUpdatesAtStartup } from './settingsSlice';
import UpdateCheckCompleteDialog from './UpdateCheckCompleteDialog';

const { white, gray700, nordicBlue } = colors;

export default () => {
    const dispatch = useLauncherDispatch();

    const shouldCheckForUpdatesAtStartup = useLauncherSelector(
        getShouldCheckForUpdatesAtStartup
    );
    const isSendingUsageData = useLauncherSelector(getIsSendingUsageData);

    const sources = useLauncherSelector(getSources);

    const { isCheckingForUpdates, lastUpdateCheckDate } =
        useLauncherSelector(getUpdateCheckStatus);

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
                        {lastUpdateCheckDate != null && (
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
                <Card body id="app-sources">
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
                        .filter(name => name !== OFFICIAL)
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
                <UpdateCheckCompleteDialog />
                <AddSourceDialog />
                <ConfirmRemoveSourceDialog />
            </div>
        </WithScrollbarContainer>
    );
};
