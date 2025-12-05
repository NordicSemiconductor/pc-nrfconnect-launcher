/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { ExternalLink } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { type TokenInformation } from '../../../../ipc/artifactoryToken';
import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import NrfCard from '../../layout/NrfCard';
import {
    getArtifactoryTokenInformation,
    showAddArtifactoryToken,
    showRemoveArtifactoryToken,
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

    const setToken = (
        <Button
            variant="outline-primary"
            onClick={() => dispatch(showAddArtifactoryToken())}
        >
            {token ? 'Replace' : 'Set'} token
        </Button>
    );

    return (
        <NrfCard title="Authentication" titleButton={setToken}>
            <Row className="tw-mt-4">
                {token == null ? (
                    <Col className="small text-muted">
                        To access restricted app sources from Nordic
                        Semiconductor, you need an identity token. Generating a
                        token is described in{' '}
                        <ExternalLink
                            href="https://docs.nordicsemi.com/bundle/nrf-connect-desktop/page/working_with_authentications_tokens.html#generating-a-new-token"
                            label="Working with identity tokens"
                        />
                        .
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
                                onClick={() =>
                                    dispatch(showRemoveArtifactoryToken())
                                }
                                title="Remove identity token"
                            >
                                Remove
                            </Button>
                        </Col>
                    </>
                )}
            </Row>
        </NrfCard>
    );
};
