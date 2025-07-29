/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

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
import { clipboard } from 'electron';

import { OFFICIAL } from '../../../../common/sources';
import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import {
    getSourcesInUse,
    showAddSource,
    showRemoveSource,
} from '../../sources/sourcesSlice';

export default () => {
    const dispatch = useLauncherDispatch();

    const sourcesInUse = useLauncherSelector(getSourcesInUse);

    return (
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
            {sourcesInUse
                .filter(source => source.name !== OFFICIAL)
                .map(source => (
                    <Row key={source.name}>
                        <Col className="item-name text-capitalize">
                            {source.name}
                        </Col>
                        <Col xs="auto">
                            <ButtonToolbar>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() =>
                                        clipboard.writeText(source.url)
                                    }
                                    title="Copy URL to clipboard"
                                >
                                    Copy URL
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() =>
                                        dispatch(showRemoveSource(source.name))
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
    );
};
