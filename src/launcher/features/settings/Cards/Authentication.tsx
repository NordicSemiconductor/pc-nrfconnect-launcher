/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {
    ErrorDialogActions,
    ExternalLink,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import cleanIpcErrorMessage from '../../../../common/cleanIpcErrorMessage';
import {
    inMain as artifactoryToken,
    type TokenInformation,
} from '../../../../ipc/artifactoryToken';
import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import {
    getArtifactoryTokenInformation,
    removeArtifactoryTokenInformation,
    showAddArtifactoryToken,
} from '../settingsSlice';

const Token: React.FC<{ token: TokenInformation }> = ({ token }) => (
    <>
        ID: {token.token_id}
        {token.description != null && (
            <>
                <br />
                Description: {token.description}
            </>
        )}
        {token.expiry != null && (
            <>
                <br />
                Expires: {new Date(token.expiry * 1000).toISOString()}
            </>
        )}
    </>
);

export default () => {
    const dispatch = useLauncherDispatch();

    const token = useLauncherSelector(getArtifactoryTokenInformation);

    const forgetToken = async () => {
        try {
            await artifactoryToken.removeToken();
            dispatch(removeArtifactoryTokenInformation());
        } catch (error) {
            dispatch(
                ErrorDialogActions.showDialog(
                    `Unable to forget token.`,
                    undefined,
                    cleanIpcErrorMessage(describeError(error))
                )
            );
        }
    };

    return (
        <Card body id="app-sources">
            <Row>
                <Col>
                    <Card.Title>Authentication</Card.Title>
                </Col>
                <Col xs="auto">
                    <Button
                        variant="outline-primary"
                        onClick={() => dispatch(showAddArtifactoryToken())}
                    >
                        {token ? 'Replace' : 'Set'} token
                    </Button>
                </Col>
            </Row>
            <Row>
                {token == null ? (
                    <Col className="small text-muted">
                        To access non-external sources from Nordic
                        Semiconductor, get an identity token from{' '}
                        <ExternalLink href="https://files.nordicsemi.com/ui/user_profile" />{' '}
                        and set it here.
                    </Col>
                ) : (
                    <>
                        <Col className="small">
                            <Token token={token} />
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={forgetToken}
                                title="Forget identity token"
                            >
                                Forget
                            </Button>
                        </Col>
                    </>
                )}
            </Row>
        </Card>
    );
};
